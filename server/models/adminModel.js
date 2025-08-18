import db from '../db/db.js';

const ACTIVE_STATUSES = ['pending', 'paid'];

const REVENUE_STATUSES = ['paid', 'shipped'];

export async function getAdminStats() {
  
  const [activeRows] = await db.query(
    `SELECT COUNT(*) AS active_orders
     FROM orders
     WHERE status IN (?, ?)`,
    ACTIVE_STATUSES
  );
  const active_orders = activeRows[0]?.active_orders || 0;

  const [revRows] = await db.query(
    `SELECT COALESCE(SUM(total_price),0) AS total_revenue
     FROM orders
     WHERE status IN (?, ?)`,
    REVENUE_STATUSES
  );
  const total_revenue = Number(revRows[0]?.total_revenue || 0);

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
