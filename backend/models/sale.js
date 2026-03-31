// backend/models/sale.js
const db = require('../config/db');

const Sale = {};

Sale.create = async (saleData, connection) => {
    const conn = connection || db;
    const { customer_id, total_amount } = saleData;
    const sale_date = new Date().toISOString().slice(0, 10);
    const sql = 'INSERT INTO sales (customer_id, sale_date, total_amount) VALUES (?, ?, ?)';
    const [result] = await conn.query(sql, [customer_id, sale_date, total_amount]);
    // Return the insertId only — do NOT call findById here because
    // the row isn't committed yet and a pool connection can't see it.
    return { id: result.insertId };
};

Sale.addItem = async (itemData, connection) => {
    const conn = connection || db;
    const { sale_id, product_id, quantity, price_at_sale } = itemData;
    const sql = 'INSERT INTO sale_items (sale_id, product_id, quantity, price_at_sale) VALUES (?, ?, ?, ?)';
    const [result] = await conn.query(sql, [sale_id, product_id, quantity, price_at_sale]);
    return result;
};

// --- THIS FUNCTION IS THE FIX ---
// It now uses LEFT JOIN and selects the 'status' column.
Sale.findAll = async () => {
    const sql = `
        SELECT 
            s.id, 
            s.customer_id, 
            COALESCE(c.name, 'Customer Deleted') as customer_name, /* Handle deleted customers */
            s.sale_date, 
            s.total_amount,
            s.status
        FROM sales s
        LEFT JOIN customers c ON s.customer_id = c.id  /* Use LEFT JOIN */
        ORDER BY s.sale_date DESC, s.id DESC
    `;
    const [rows] = await db.query(sql);
    return rows;
};

// --- THIS FUNCTION IS ALSO FIXED ---
Sale.findById = async (id) => {
    const saleSql = `
        SELECT 
            s.id, 
            s.customer_id, 
            COALESCE(c.name, 'Customer Deleted') as customer_name, /* Handle deleted customers */
            s.sale_date, 
            s.total_amount,
            s.status
        FROM sales s
        LEFT JOIN customers c ON s.customer_id = c.id /* Use LEFT JOIN */
        WHERE s.id = ?
    `;
    const [saleRows] = await db.query(saleSql, [id]);
    if (saleRows.length === 0) return null;

    const itemsSql = `
        SELECT 
            si.product_id, 
            COALESCE(p.name, 'Product Deleted') as product_name, /* Handle deleted products */
            si.quantity, 
            si.price_at_sale
        FROM sale_items si
        LEFT JOIN products p ON si.product_id = p.id /* Use LEFT JOIN */
        WHERE si.sale_id = ?
    `;
    const [itemRows] = await db.query(itemsSql, [id]);

    const sale = saleRows[0];
    sale.items = itemRows;

    return sale;
};

// This function is for your Reports page
Sale.getFullReportData = async () => {
    const salesOverTimeSql = `
        SELECT 
            sale_date,
            SUM(total_amount) AS daily_revenue
        FROM sales
        WHERE sale_date >= CURDATE() - INTERVAL 30 DAY
        GROUP BY sale_date
        ORDER BY sale_date ASC;
    `;
    const salesByTypeSql = `
        SELECT 
            p.type,
            SUM(si.price_at_sale * si.quantity) AS type_revenue
        FROM sale_items si
        LEFT JOIN products p ON si.product_id = p.id
        GROUP BY p.type
        ORDER BY type_revenue DESC;
    `;
    const bestSellersSql = `
        SELECT 
            p.name AS product_name,
            p.brand AS product_brand,
            SUM(si.quantity) AS total_units_sold,
            SUM(si.price_at_sale * si.quantity) AS total_revenue
        FROM sale_items si
        LEFT JOIN products p ON si.product_id = p.id
        GROUP BY p.id, p.name, p.brand
        ORDER BY total_units_sold DESC
        LIMIT 10;
    `;
    const profitSql = `
        SELECT 
            SUM(si.price_at_sale * si.quantity) AS total_revenue,
            SUM(p.purchase_rate * si.quantity) AS total_cost
        FROM sale_items si
        LEFT JOIN products p ON si.product_id = p.id
        WHERE p.purchase_rate IS NOT NULL;
    `;
    
    // Use Promise.all to run queries concurrently
    const [
        [salesOverTime],
        [salesByType],
        [bestSellers],
        [profitResult]
    ] = await Promise.all([
        db.query(salesOverTimeSql),
        db.query(salesByTypeSql),
        db.query(bestSellersSql),
        db.query(profitSql)
    ]);

    // Ensure profitData is an object, not an array
    const profitData = profitResult[0] || { total_revenue: 0, total_cost: 0 };
    const totalProfit = (profitData.total_revenue || 0) - (profitData.total_cost || 0);

    return { salesOverTime, salesByType, bestSellers, totalProfit };
};

// This function is for your Sales page status dropdown
Sale.updateStatus = async (saleId, status) => {
    const sql = `UPDATE sales SET status = ? WHERE id = ?`;
    const [result] = await db.query(sql, [status, saleId]);
    if (result.affectedRows === 0) return null;
    return Sale.findById(saleId);
};

module.exports = Sale;