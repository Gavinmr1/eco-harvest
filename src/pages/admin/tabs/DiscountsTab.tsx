import { type Dispatch, type SetStateAction } from "react";
import { type DiscountType, type DiscountCodeRecord } from "../../../types/discount";

export type DiscountFormState = {
  code: string;
  amount: string;
  type: DiscountType;
  isActive: boolean;
  maxUses: string;
  expiresAt: string;
  minOrderTotal: string;
};

export type DiscountsTabModel = {
  discountForm: DiscountFormState;
  setDiscountForm: Dispatch<SetStateAction<DiscountFormState>>;
  discountCodes: DiscountCodeRecord[];
  handleSaveDiscountCode: () => Promise<void>;
};

type DiscountsTabProps = {
  model: DiscountsTabModel;
};

export function DiscountsTab({ model }: DiscountsTabProps) {
  const { discountForm, setDiscountForm, discountCodes, handleSaveDiscountCode } = model;

  return (
    <section className="border-background-border bg-background rounded border p-4 shadow">
      <h2 className="text-foreground-dimmed1 text-lg font-semibold">Discount Codes</h2>
      <div className="mt-3 grid gap-2 md:grid-cols-4">
        <input
          className="border-background-border bg-background rounded border p-2 text-sm"
          placeholder="Code"
          value={discountForm.code}
          onChange={e => setDiscountForm(prev => ({ ...prev, code: e.target.value }))}
        />
        <input
          className="border-background-border bg-background rounded border p-2 text-sm"
          placeholder="Amount"
          type="number"
          min={0}
          step="0.01"
          value={discountForm.amount}
          onChange={e => setDiscountForm(prev => ({ ...prev, amount: e.target.value }))}
        />
        <select
          className="border-background-border bg-background rounded border p-2 text-sm"
          value={discountForm.type}
          onChange={e =>
            setDiscountForm(prev => ({ ...prev, type: e.target.value as DiscountType }))
          }
        >
          <option value="fixed">Fixed ($)</option>
          <option value="percent">Percent (%)</option>
        </select>
        <input
          className="border-background-border bg-background rounded border p-2 text-sm"
          placeholder="Max uses (optional)"
          type="number"
          min={1}
          step="1"
          value={discountForm.maxUses}
          onChange={e => setDiscountForm(prev => ({ ...prev, maxUses: e.target.value }))}
        />
        <input
          className="border-background-border bg-background rounded border p-2 text-sm"
          placeholder="Min order total (optional)"
          type="number"
          min={0}
          step="0.01"
          value={discountForm.minOrderTotal}
          onChange={e => setDiscountForm(prev => ({ ...prev, minOrderTotal: e.target.value }))}
        />
        <input
          className="border-background-border bg-background rounded border p-2 text-sm"
          type="datetime-local"
          value={discountForm.expiresAt}
          onChange={e => setDiscountForm(prev => ({ ...prev, expiresAt: e.target.value }))}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={discountForm.isActive}
            onChange={e => setDiscountForm(prev => ({ ...prev, isActive: e.target.checked }))}
          />
          Active
        </label>
        <button
          type="button"
          className="rounded bg-green-700 px-3 py-2 text-sm text-white transition-opacity hover:opacity-90"
          onClick={() => void handleSaveDiscountCode()}
        >
          Save Discount Code
        </button>
      </div>

      {discountCodes.length > 0 ? (
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-xs">
            <thead>
              <tr className="text-foreground-dimmed1 border-background-border border-b">
                <th className="px-2 py-2">Code</th>
                <th className="px-2 py-2">Value</th>
                <th className="px-2 py-2">Usage</th>
                <th className="px-2 py-2">Min Total</th>
                <th className="px-2 py-2">Expires</th>
                <th className="px-2 py-2">Active</th>
              </tr>
            </thead>
            <tbody>
              {discountCodes.map(discount => (
                <tr key={discount.id} className="border-background-border border-b">
                  <td className="px-2 py-2 font-medium">{discount.code}</td>
                  <td className="px-2 py-2">
                    {discount.type === "percent"
                      ? `${discount.amount.toFixed(2)}%`
                      : `$${discount.amount.toFixed(2)}`}
                  </td>
                  <td className="px-2 py-2">
                    {discount.usedCount}
                    {discount.maxUses !== null ? ` / ${discount.maxUses}` : ""}
                  </td>
                  <td className="px-2 py-2">
                    {discount.minOrderTotal !== null
                      ? `$${discount.minOrderTotal.toFixed(2)}`
                      : "-"}
                  </td>
                  <td className="px-2 py-2">
                    {discount.expiresAt ? new Date(discount.expiresAt).toLocaleString() : "-"}
                  </td>
                  <td className="px-2 py-2">{discount.isActive ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-foreground-dimmed2 mt-2 text-sm">No discount codes created yet.</p>
      )}
    </section>
  );
}
