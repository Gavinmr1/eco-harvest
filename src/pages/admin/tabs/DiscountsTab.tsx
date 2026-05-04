import { type Dispatch, type SetStateAction } from "react";
import clsx from "clsx";
import { Button, Checkbox } from "react-aria-components";
import { type DiscountType, type DiscountCodeRecord } from "../../../types/discount";
import FormInput from "../../../components/FormInput";
import FormSelect from "../../../components/FormSelect";
import Typography from "../../../components/Typography";

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
    <section className="border-background-border/20 rounded-2xl border bg-white/10 p-6 shadow-md backdrop-blur-lg">
      <div className="flex flex-col gap-1">
        <Typography as="h2">Discount Codes</Typography>
        <Typography as="p" variant="muted">
          Create and monitor promotions used at checkout.
        </Typography>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-4">
        <FormInput
          className="rounded-lg"
          placeholder="Code"
          value={discountForm.code}
          onChange={e => setDiscountForm(prev => ({ ...prev, code: e.target.value }))}
        />
        <FormInput
          className="rounded-lg"
          placeholder="Amount"
          type="number"
          min={0}
          step="0.01"
          value={discountForm.amount}
          onChange={e => setDiscountForm(prev => ({ ...prev, amount: e.target.value }))}
        />
        <FormSelect
          className="rounded-lg"
          value={discountForm.type}
          onChange={e =>
            setDiscountForm(prev => ({ ...prev, type: e.target.value as DiscountType }))
          }
        >
          <option value="fixed">Fixed ($)</option>
          <option value="percent">Percent (%)</option>
        </FormSelect>
        <FormInput
          className="rounded-lg"
          placeholder="Max uses (optional)"
          type="number"
          min={1}
          step="1"
          value={discountForm.maxUses}
          onChange={e => setDiscountForm(prev => ({ ...prev, maxUses: e.target.value }))}
        />
        <FormInput
          className="rounded-lg"
          placeholder="Min order total (optional)"
          type="number"
          min={0}
          step="0.01"
          value={discountForm.minOrderTotal}
          onChange={e => setDiscountForm(prev => ({ ...prev, minOrderTotal: e.target.value }))}
        />
        <FormInput
          className="rounded-lg"
          type="datetime-local"
          value={discountForm.expiresAt}
          onChange={e => setDiscountForm(prev => ({ ...prev, expiresAt: e.target.value }))}
        />
        <Checkbox
          isSelected={discountForm.isActive}
          onChange={isSelected => setDiscountForm(prev => ({ ...prev, isActive: isSelected }))}
          className="flex items-center gap-2 text-sm"
        >
          {({ isSelected }) => (
            <>
              <div
                aria-hidden="true"
                className={clsx(
                  "flex size-4 items-center justify-center rounded border text-[10px] font-bold transition-colors",
                  isSelected
                    ? "border-yellow-500 bg-yellow-500 text-black"
                    : "border-background-border-dimmed1 bg-background-dimmed1"
                )}
              >
                {isSelected ? "✓" : null}
              </div>
              <Typography as="span">Active</Typography>
            </>
          )}
        </Checkbox>
        <Button
          type="button"
          className="btn-secondary"
          onPress={() => void handleSaveDiscountCode()}
        >
          Save Discount Code
        </Button>
      </div>

      {discountCodes.length > 0 ? (
        <div className="border-background-border/20 mt-4 overflow-x-auto rounded-2xl border bg-white/5">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="text-foreground-dimmed1 border-b border-white/10 bg-white/5">
                <th className="px-3 py-3">
                  <Typography as="span" variant="caption" className="tracking-wide uppercase">
                    Code
                  </Typography>
                </th>
                <th className="px-3 py-3">
                  <Typography as="span" variant="caption" className="tracking-wide uppercase">
                    Value
                  </Typography>
                </th>
                <th className="px-3 py-3">
                  <Typography as="span" variant="caption" className="tracking-wide uppercase">
                    Usage
                  </Typography>
                </th>
                <th className="px-3 py-3">
                  <Typography as="span" variant="caption" className="tracking-wide uppercase">
                    Min Total
                  </Typography>
                </th>
                <th className="px-3 py-3">
                  <Typography as="span" variant="caption" className="tracking-wide uppercase">
                    Expires
                  </Typography>
                </th>
                <th className="px-3 py-3">
                  <Typography as="span" variant="caption" className="tracking-wide uppercase">
                    Active
                  </Typography>
                </th>
              </tr>
            </thead>
            <tbody>
              {discountCodes.map(discount => (
                <tr key={discount.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="px-3 py-3 font-mono text-xs font-medium">{discount.code}</td>
                  <td className="px-3 py-3">
                    {discount.type === "percent"
                      ? `${discount.amount.toFixed(2)}%`
                      : `$${discount.amount.toFixed(2)}`}
                  </td>
                  <td className="px-3 py-3">
                    {discount.usedCount}
                    {discount.maxUses !== null ? ` / ${discount.maxUses}` : ""}
                  </td>
                  <td className="px-3 py-3">
                    {discount.minOrderTotal !== null
                      ? `$${discount.minOrderTotal.toFixed(2)}`
                      : "-"}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {discount.expiresAt ? new Date(discount.expiresAt).toLocaleString() : "-"}
                  </td>
                  <td className="px-3 py-3">
                    <Typography
                      as="span"
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide uppercase ${
                        discount.isActive
                          ? "border-green-500/30 bg-green-500/15 text-green-200"
                          : "text-foreground-dimmed2 border-white/20 bg-white/10"
                      }`}
                    >
                      {discount.isActive ? "Active" : "Inactive"}
                    </Typography>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Typography as="p" variant="muted" className="mt-2">
          No discount codes created yet.
        </Typography>
      )}
    </section>
  );
}
