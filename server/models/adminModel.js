// server/models/adminModel.js
import db from '../db/db.js';

// Active = pending + paid (לא בוטלו/לא סופקו)
const ACTIVE_STATUSES = ['pending', 'paid'];
// Revenue נספר רק מהזמנות ששולמו/נשלחו
const REVENUE_STATUSES = ['paid', 'shipped'];

export async function getAdminStats() {
  // 1) Active Orders
  const [activeRows] = await db.query(
    `SELECT COUNT(*) AS active_orders
     FROM orders
     WHERE status IN (?, ?)`,
    ACTIVE_STATUSES
  );
  const active_orders = activeRows[0]?.active_orders || 0;

  // 2) Total Revenue (all-time, from paid+shipped)
  const [revRows] = await db.query(
    `SELECT COALESCE(SUM(total_price),0) AS total_revenue
     FROM orders
     WHERE status IN (?, ?)`,
    REVENUE_STATUSES
  );
  const total_revenue = Number(revRows[0]?.total_revenue || 0);

  // 3) Top Sellers (30 days) — לשנות לכל הזמנים? הסר את תנאי התאריך למטה
  const [topRows] = await db.query(
    `SELECT 
        p.id AS product_id,
        p.title,
        SUM(oi.amount) AS qty_sold,
        SUM(oi.amount * oi.price_at_order) AS revenue
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     JOIN products p ON p.id = oi.product_id
     WHERE o.status IN (?, ?)
       AND o.created_at >= NOW() - INTERVAL 30 DAY
     GROUP BY p.id, p.title
     ORDER BY revenue DESC
     LIMIT 5`,
    REVENUE_STATUSES
  );

  return {
    active_orders,
    total_revenue,
    top_products: topRows.map(r => ({
      product_id: r.product_id,
      title: r.title,
      qty_sold: Number(r.qty_sold || 0),
      revenue: Number(r.revenue || 0)
    }))
  };
}
