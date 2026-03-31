const Sale = require('../models/sale');
const Product = require('../models/product');
const Customer = require('../models/customer');
// const { sendTemplateMessage } = require('../services/whatsappService'); // WhatsApp is commented out
const db = require('../config/db');

exports.createSale = async (req, res) => {
    const { customer_id, total_amount, items } = req.body;
    if (!customer_id || !total_amount || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Missing required sale data.' });
    }
    const connection = await db.getConnection();
    let customer;
    try {
        await connection.beginTransaction();
        customer = await Customer.findById(customer_id);
        if (!customer) { throw new Error('Customer not found.'); }
        const saleData = { customer_id, total_amount };
        const newSale = await Sale.create(saleData, connection);
        for (const item of items) {
            const saleItemData = {
                sale_id: newSale.id,
                product_id: item.product_id,
                quantity: item.quantity,
                price_at_sale: item.price_at_sale
            };
            await Sale.addItem(saleItemData, connection);
            await Product.updateStock(item.product_id, item.quantity, connection);
        }
        await connection.commit();
        // NOW it's safe to fetch — the row is committed and visible to the pool
        const completedSale = await Sale.findById(newSale.id);
        res.status(201).json(completedSale);
    } catch (error) {
        await connection.rollback();
        console.error('createSale Error:', error); // <-- THIS IS THE FIX
        res.status(500).json({ message: 'Server error during sale creation', error: error.message });
    } finally {
        connection.release();
    }
};

exports.getAllSales = async (req, res) => {
    try {
        const sales = await Sale.findAll();
        res.status(200).json(sales);
    } catch (error) {
        console.error('getAllSales Error:', error); // <-- THIS IS THE FIX
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getSaleById = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id);
        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }
        res.status(200).json(sale);
    } catch (error) {
        console.error('getSaleById Error:', error); // <-- THIS IS THE FIX
        s.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateSaleStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ message: 'Status is required.' });
        }
        const saleId = req.params.id;
        const updatedSale = await Sale.updateStatus(saleId, status);
        if (!updatedSale) {
            return res.status(404).json({ message: 'Sale not found' });
        }
        res.status(200).json(updatedSale);
    } catch (error) {
        console.error('updateSaleStatus Error:', error); // <-- THIS IS THE FIX
        res.status(500).json({ message: 'Server error updating sale status', error: error.message });
    }
};

exports.getFullReport = async (req, res) => {
    try {
        const reportData = await Sale.getFullReportData();
        res.status(200).json(reportData);
    } catch (error) {
        console.error('getFullReport Error:', error); // <-- THIS IS THE FIX
        res.status(500).json({ message: 'Server error fetching full report', error: error.message });
    }
};