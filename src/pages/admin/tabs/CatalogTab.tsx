import { type Dispatch, type SetStateAction } from "react";
import { Button } from "react-aria-components";
import { type PreferenceOption, type SubscriptionPlanOption } from "../../../types/catalog";
import FormInput from "../../../components/FormInput";
import Typography from "../../../components/Typography";

export type CatalogPlanFormState = {
  value: string;
  label: string;
  description: string;
  weeks: string;
};

export type CatalogPreferenceFormState = {
  label: string;
  description: string;
};

export type CatalogTabModel = {
  plans: SubscriptionPlanOption[];
  preferences: PreferenceOption[];
  planForm: CatalogPlanFormState;
  setPlanForm: Dispatch<SetStateAction<CatalogPlanFormState>>;
  preferenceForm: CatalogPreferenceFormState;
  setPreferenceForm: Dispatch<SetStateAction<CatalogPreferenceFormState>>;
  handleSavePlan: () => Promise<void>;
  handleDeletePlan: (planValue: string) => Promise<void>;
  handleSavePreference: () => Promise<void>;
  handleDeletePreference: (label: string) => Promise<void>;
};

type CatalogTabProps = {
  model: CatalogTabModel;
};

export function CatalogTab({ model }: CatalogTabProps) {
  const {
    plans,
    preferences,
    planForm,
    setPlanForm,
    preferenceForm,
    setPreferenceForm,
    handleSavePlan,
    handleDeletePlan,
    handleSavePreference,
    handleDeletePreference,
  } = model;

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <div className="border-background-border bg-background rounded border p-4 shadow">
        <Typography as="h2" className="text-foreground-dimmed1 text-lg font-semibold">Catalog Plans</Typography>

        <div className="mt-3 grid gap-2">
          <FormInput
            className="rounded border p-2 text-sm"
            placeholder="Value (e.g. 12-week)"
            value={planForm.value}
            onChange={event => setPlanForm(current => ({ ...current, value: event.target.value }))}
          />
          <FormInput
            className="rounded border p-2 text-sm"
            placeholder="Label"
            value={planForm.label}
            onChange={event => setPlanForm(current => ({ ...current, label: event.target.value }))}
          />
          <FormInput
            className="rounded border p-2 text-sm"
            placeholder="Description"
            value={planForm.description}
            onChange={event =>
              setPlanForm(current => ({ ...current, description: event.target.value }))
            }
          />
          <FormInput
            className="rounded border p-2 text-sm"
            placeholder="Weeks"
            type="number"
            min={1}
            step={1}
            value={planForm.weeks}
            onChange={event => setPlanForm(current => ({ ...current, weeks: event.target.value }))}
          />
          <Button
            type="button"
            className="rounded bg-green-700 px-3 py-2 text-sm text-white transition-opacity hover:opacity-90"
            onPress={() => void handleSavePlan()}
          >
            Save Plan
          </Button>
        </div>

        {plans.length > 0 ? (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-xs">
              <thead>
                <tr className="text-foreground-dimmed1 border-background-border border-b">
                  <th className="px-2 py-2">Value</th>
                  <th className="px-2 py-2">Label</th>
                  <th className="px-2 py-2">Weeks</th>
                  <th className="px-2 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map(plan => (
                  <tr key={plan.value} className="border-background-border border-b">
                    <td className="px-2 py-2 font-medium">{plan.value}</td>
                    <td className="px-2 py-2">{plan.label}</td>
                    <td className="px-2 py-2">{plan.weeks}</td>
                    <td className="px-2 py-2">
                      <Button
                        type="button"
                        className="rounded bg-red-700 px-2 py-1 text-xs text-white transition-opacity hover:opacity-90"
                        onPress={() => void handleDeletePlan(plan.value)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Typography as="p" className="text-foreground-dimmed2 mt-2 text-sm">No plans in catalog.</Typography>
        )}
      </div>

      <div className="border-background-border bg-background rounded border p-4 shadow">
        <Typography as="h2" className="text-foreground-dimmed1 text-lg font-semibold">Catalog Preferences</Typography>

        <div className="mt-3 grid gap-2">
          <FormInput
            className="rounded border p-2 text-sm"
            placeholder="Label"
            value={preferenceForm.label}
            onChange={event =>
              setPreferenceForm(current => ({ ...current, label: event.target.value }))
            }
          />
          <FormInput
            className="rounded border p-2 text-sm"
            placeholder="Description"
            value={preferenceForm.description}
            onChange={event =>
              setPreferenceForm(current => ({ ...current, description: event.target.value }))
            }
          />
          <Button
            type="button"
            className="rounded bg-green-700 px-3 py-2 text-sm text-white transition-opacity hover:opacity-90"
            onPress={() => void handleSavePreference()}
          >
            Save Preference
          </Button>
        </div>

        {preferences.length > 0 ? (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-xs">
              <thead>
                <tr className="text-foreground-dimmed1 border-background-border border-b">
                  <th className="px-2 py-2">Label</th>
                  <th className="px-2 py-2">Description</th>
                  <th className="px-2 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {preferences.map(preference => (
                  <tr key={preference.label} className="border-background-border border-b">
                    <td className="px-2 py-2 font-medium">{preference.label}</td>
                    <td className="px-2 py-2">{preference.description}</td>
                    <td className="px-2 py-2">
                      <Button
                        type="button"
                        className="rounded bg-red-700 px-2 py-1 text-xs text-white transition-opacity hover:opacity-90"
                        onPress={() => void handleDeletePreference(preference.label)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Typography as="p" className="text-foreground-dimmed2 mt-2 text-sm">No preferences in catalog.</Typography>
        )}
      </div>
    </section>
  );
}
