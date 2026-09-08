"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type FormFieldDraft = {
  id?: string;
  label: string;
  helpText?: string;
  type: "TEXT" | "TEXTAREA" | "EMAIL" | "PHONE" | "NUMBER" | "SELECT" | "MULTISELECT" | "CHECKBOX" | "DATE";
  options?: string;
  isRequired: boolean;
  sortOrder: number;
};

const fieldTypes = [
  { value: "TEXT", label: "Text" },
  { value: "TEXTAREA", label: "Textarea" },
  { value: "EMAIL", label: "Email" },
  { value: "PHONE", label: "Phone" },
  { value: "NUMBER", label: "Number" },
  { value: "SELECT", label: "Dropdown" },
  { value: "MULTISELECT", label: "Multi-select" },
  { value: "CHECKBOX", label: "Checkbox" },
  { value: "DATE", label: "Date" },
];

interface Props {
  fields: FormFieldDraft[];
  onChange: (fields: FormFieldDraft[]) => void;
}

export function FormFieldBuilder({ fields, onChange }: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  function addField() {
    onChange([...fields, { label: "", type: "TEXT", isRequired: false, sortOrder: fields.length }]);
  }

  function removeField(index: number) {
    onChange(fields.filter((_, i) => i !== index).map((f, i) => ({ ...f, sortOrder: i })));
  }

  function updateField(index: number, updates: Partial<FormFieldDraft>) {
    onChange(fields.map((f, i) => (i === index ? { ...f, ...updates } : f)));
  }

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    const newFields = [...fields];
    const [dragged] = newFields.splice(dragIndex, 1);
    newFields.splice(index, 0, dragged);
    onChange(newFields.map((f, i) => ({ ...f, sortOrder: i })));
    setDragIndex(index);
  }

  function handleDragEnd() {
    setDragIndex(null);
  }

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div
          key={index}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className={cn(
            "border border-[var(--border)] rounded-lg p-5 bg-[var(--card)] cursor-grab active:cursor-grabbing",
            "transition-opacity duration-150",
            dragIndex === index && "opacity-50"
          )}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--muted-foreground)] font-mono">#{index + 1}</span>
              <Badge variant="muted">{field.type}</Badge>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => removeField(index)}>
              Remove
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`field-label-${index}`} required>Label</Label>
              <Input
                id={`field-label-${index}`}
                value={field.label}
                onChange={(e) => updateField(index, { label: e.target.value })}
                placeholder="e.g. T-shirt size"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`field-type-${index}`}>Type</Label>
              <Select
                id={`field-type-${index}`}
                value={field.type}
                onChange={(e) => updateField(index, { type: e.target.value as FormFieldDraft["type"] })}
                options={fieldTypes}
              />
            </div>
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <Label htmlFor={`field-help-${index}`}>Help Text</Label>
              <Input
                id={`field-help-${index}`}
                value={field.helpText ?? ""}
                onChange={(e) => updateField(index, { helpText: e.target.value })}
                placeholder="Optional hint for the user"
              />
            </div>
            {(field.type === "SELECT" || field.type === "MULTISELECT") && (
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <Label htmlFor={`field-options-${index}`}>Options (comma-separated)</Label>
                <Input
                  id={`field-options-${index}`}
                  value={field.options ?? ""}
                  onChange={(e) => updateField(index, { options: e.target.value })}
                  placeholder="S, M, L, XL"
                />
              </div>
            )}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id={`required-${index}`}
                checked={field.isRequired}
                onChange={(e) => updateField(index, { isRequired: e.target.checked })}
                className="h-4 w-4 rounded border-[var(--border)]"
              />
              <Label htmlFor={`required-${index}`}>Required</Label>
            </div>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={addField}>
        + Add Field
      </Button>
    </div>
  );
}
