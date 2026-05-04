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
      <div className="border-background-border/20 rounded-2xl border bg-white/10 p-6 shadow-md backdrop-blur-lg">
        <div className="flex flex-col gap-1">
          <Typography as="h2">Catalog Plans</Typography>
          <Typography as="p" variant="muted">
            Manage available subscription durations shown to customers.
          </Typography>
        </div>

        <div className="mt-4 grid gap-2">
          <FormInput
            className="rounded-lg"
            placeholder="Value (e.g. 12-week)"
            value={planForm.value}
            onChange={event => setPlanForm(current => ({ ...current, value: event.target.value }))}
          />
          <FormInput
            className="rounded-lg"
            placeholder="Label"
            value={planForm.label}
            onChange={event => setPlanForm(current => ({ ...current, label: event.target.value }))}
          />
          <FormInput
            className="rounded-lg"
            placeholder="Description"
            value={planForm.description}
            onChange={event =>
              setPlanForm(current => ({ ...current, description: event.target.value }))
            }
          />
          <FormInput
            className="rounded-lg"
            placeholder="Weeks"
            type="number"
            min={1}
            step={1}
            value={planForm.weeks}
            onChange={event => setPlanForm(current => ({ ...current, weeks: event.target.value }))}
          />
          <Button type="button" className="btn-secondary" onPress={() => void handleSavePlan()}>
            Save Plan
          </Button>
        </div>

        {plans.length > 0 ? (
          <div className="border-background-border/20 mt-4 overflow-x-auto rounded-2xl border bg-white/5">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="text-foreground-dimmed1 border-b border-white/10 bg-white/5">
                  <th className="px-3 py-3">
                    <Typography as="span" variant="caption" className="tracking-wide uppercase">
                      Value
                    </Typography>
                  </th>
                  <th className="px-3 py-3">
                    <Typography as="span" variant="caption" className="tracking-wide uppercase">
                      Label
                    </Typography>
                  </th>
                  <th className="px-3 py-3">
                    <Typography as="span" variant="caption" className="tracking-wide uppercase">
                      Weeks
                    </Typography>
                  </th>
                  <th className="px-3 py-3">
                    <Typography as="span" variant="caption" className="tracking-wide uppercase">
                      Actions
                    </Typography>
                  </th>
                </tr>
              </thead>
              <tbody>
                {plans.map(plan => (
                  <tr key={plan.value} className="border-b border-white/10 hover:bg-white/5">
                    <td className="px-3 py-3 font-medium">
                      <Typography as="span" className="font-mono text-xs">
                        {plan.value}
                      </Typography>
                    </td>
                    <td className="px-3 py-3">
                      <Typography as="span">{plan.label}</Typography>
                    </td>
                    <td className="px-3 py-3">
                      <Typography as="span">{plan.weeks}</Typography>
                    </td>
                    <td className="px-3 py-3">
                      <Button
                        type="button"
                        className="btn-destructive px-3 py-1.5 text-xs"
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
          <Typography as="p" variant="muted" className="mt-2">
            No plans in catalog.
          </Typography>
        )}
      </div>

      <div className="border-background-border/20 rounded-2xl border bg-white/10 p-6 shadow-md backdrop-blur-lg">
        <div className="flex flex-col gap-1">
          <Typography as="h2">Catalog Preferences</Typography>
          <Typography as="p" variant="muted">
            Update preference options customers can choose in box setup.
          </Typography>
        </div>

        <div className="mt-4 grid gap-2">
          <FormInput
            className="rounded-lg"
            placeholder="Label"
            value={preferenceForm.label}
            onChange={event =>
              setPreferenceForm(current => ({ ...current, label: event.target.value }))
            }
          />
          <FormInput
            className="rounded-lg"
            placeholder="Description"
            value={preferenceForm.description}
            onChange={event =>
              setPreferenceForm(current => ({ ...current, description: event.target.value }))
            }
          />
          <Button
            type="button"
            className="btn-secondary"
            onPress={() => void handleSavePreference()}
          >
            Save Preference
          </Button>
        </div>

        {preferences.length > 0 ? (
          <div className="border-background-border/20 mt-4 overflow-x-auto rounded-2xl border bg-white/5">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="text-foreground-dimmed1 border-b border-white/10 bg-white/5">
                  <th className="px-3 py-3">
                    <Typography as="span" variant="caption" className="tracking-wide uppercase">
                      Label
                    </Typography>
                  </th>
                  <th className="px-3 py-3">
                    <Typography as="span" variant="caption" className="tracking-wide uppercase">
                      Description
                    </Typography>
                  </th>
                  <th className="px-3 py-3">
                    <Typography as="span" variant="caption" className="tracking-wide uppercase">
                      Actions
                    </Typography>
                  </th>
                </tr>
              </thead>
              <tbody>
                {preferences.map(preference => (
                  <tr key={preference.label} className="border-b border-white/10 hover:bg-white/5">
                    <td className="px-3 py-3 font-medium">
                      <Typography as="span">{preference.label}</Typography>
                    </td>
                    <td className="px-3 py-3">
                      <Typography as="span">{preference.description}</Typography>
                    </td>
                    <td className="px-3 py-3">
                      <Button
                        type="button"
                        className="btn-destructive px-3 py-1.5 text-xs"
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
          <Typography as="p" variant="muted" className="mt-2">
            No preferences in catalog.
          </Typography>
        )}
      </div>
    </section>
  );
}
