import { formatCurrency } from '@bestal/shared-utils';
import { useEffect, useState } from 'react';
import { FormField } from './form-field.js';
import { Input } from './input.js';

export type PricingEditorProps = {
  payRate: number;
  billRate: number;
  currency?: string;
  onChange?: (values: { payRate: number; billRate: number; marginPercent: number }) => void;
  readOnly?: boolean;
};

function calcMargin(pay: number, bill: number): number {
  if (bill <= 0) return 0;
  return Math.round(((bill - pay) / bill) * 1000) / 10;
}

export function PricingEditor({
  payRate: initialPay,
  billRate: initialBill,
  currency = 'USD',
  onChange,
  readOnly = false,
}: PricingEditorProps) {
  const [payRate, setPayRate] = useState(initialPay);
  const [billRate, setBillRate] = useState(initialBill);
  const marginPercent = calcMargin(payRate, billRate);

  useEffect(() => {
    setPayRate(initialPay);
    setBillRate(initialBill);
  }, [initialPay, initialBill]);

  function emit(pay: number, bill: number) {
    onChange?.({ payRate: pay, billRate: bill, marginPercent: calcMargin(pay, bill) });
  }

  if (readOnly) {
    return (
      <dl className="grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-sm text-muted-foreground">Pay rate</dt>
          <dd className="text-lg font-semibold">{formatCurrency(payRate, currency)}/hr</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Bill rate</dt>
          <dd className="text-lg font-semibold">{formatCurrency(billRate, currency)}/hr</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Margin</dt>
          <dd className="text-lg font-semibold text-emerald-600">{marginPercent}%</dd>
        </div>
      </dl>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <FormField label="Pay rate ($/hr)" htmlFor="pay-rate">
        <Input
          id="pay-rate"
          type="number"
          min={0}
          value={payRate}
          onChange={(e) => {
            const val = Number(e.target.value);
            setPayRate(val);
            emit(val, billRate);
          }}
        />
      </FormField>
      <FormField label="Bill rate ($/hr)" htmlFor="bill-rate">
        <Input
          id="bill-rate"
          type="number"
          min={0}
          value={billRate}
          onChange={(e) => {
            const val = Number(e.target.value);
            setBillRate(val);
            emit(payRate, val);
          }}
        />
      </FormField>
      <FormField label="Margin">
        <div className="flex h-10 items-center rounded-md border border-border bg-muted/50 px-3 text-sm font-semibold text-emerald-600">
          {marginPercent}%
        </div>
      </FormField>
    </div>
  );
}
