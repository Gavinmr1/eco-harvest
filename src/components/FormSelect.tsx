import {
  Children,
  forwardRef,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import clsx from "clsx";
import { Button, ListBox, ListBoxItem, Popover, Select, SelectValue } from "react-aria-components";
import Typography from "./Typography";

type FormSelectProps = SelectHTMLAttributes<HTMLSelectElement>;

type OptionLike = {
  value?: string | number;
  children?: ReactNode;
  disabled?: boolean;
};

const defaultSelectClass =
  "text-foreground border-background-border-dimmed1 bg-background-dimmed1 focus:border-yellow-500 focus:ring-yellow-500 w-full rounded-xl border px-3 py-2 outline-none transition-all";

const optionButtonClass =
  "text-foreground flex w-full cursor-pointer items-center justify-between rounded-xl text-left";

const listBoxItemClass =
  "text-foreground data-[focused]:bg-background-dimmed2 data-[selected]:bg-yellow-500 data-[selected]:text-foreground cursor-default rounded-lg px-3 py-2 text-sm outline-none transition-colors";

const FormSelect = forwardRef<HTMLButtonElement, FormSelectProps>(
  (
    {
      className,
      children,
      value,
      defaultValue,
      onChange,
      disabled,
      name,
      required,
      id,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
    },
    ref
  ) => {
    const options = Children.toArray(children).flatMap(child => {
      if (!isValidElement<OptionLike>(child) || child.type !== "option") {
        return [];
      }

      const option = child as ReactElement<OptionLike>;
      return [
        {
          value: String(option.props.value ?? ""),
          label: option.props.children,
          isDisabled: option.props.disabled ?? false,
        },
      ];
    });

    const selectedKey = value == null ? undefined : String(value);
    const defaultSelectedKey = defaultValue == null ? undefined : String(defaultValue);

    return (
      <Select
        id={id}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        name={name}
        isRequired={required}
        isDisabled={disabled}
        selectedKey={selectedKey}
        defaultSelectedKey={defaultSelectedKey}
        onSelectionChange={key => {
          if (!onChange || key == null) {
            return;
          }

          const nextValue = String(key);
          onChange({
            target: { value: nextValue },
            currentTarget: { value: nextValue },
          } as unknown as React.ChangeEvent<HTMLSelectElement>);
        }}
      >
        <Button ref={ref} className={clsx(defaultSelectClass, optionButtonClass, className)}>
          <SelectValue>
            {({ selectedText }) => selectedText ?? options[0]?.label ?? "Select an option"}
          </SelectValue>
          <Typography as="span" className="text-foreground-dimmed3 ml-2 text-xs">▼</Typography>
        </Button>
        <Popover
          className="bg-background border-background-border z-50 mt-2 overflow-hidden rounded-2xl border shadow-lg"
          style={{ width: "var(--trigger-width)" }}
        >
          <ListBox className="flex max-h-72 flex-col gap-1 p-1">
            {options.map(option => (
              <ListBoxItem
                key={option.value}
                id={option.value}
                className={listBoxItemClass}
                isDisabled={option.isDisabled}
              >
                {option.label}
              </ListBoxItem>
            ))}
          </ListBox>
        </Popover>
      </Select>
    );
  }
);

FormSelect.displayName = "FormSelect";

export default FormSelect;
