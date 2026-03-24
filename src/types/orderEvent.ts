export type OrderEventAction =
  | "status_changed"
  | "discount_applied"
  | "refund_requested"
  | "refund_approved"
  | "refund_processed"
  | "refund_added"
  | "adjustment_note_updated";

export type OrderEventRecord = {
  id: string;
  orderId: string;
  userId: string;
  action: OrderEventAction;
  summary: string;
  metadata: Record<string, string | number | boolean | null>;
  createdAt: string;
  createdBy: string;
};
