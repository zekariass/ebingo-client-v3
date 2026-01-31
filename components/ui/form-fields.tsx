"use client"

import type React from "react"

import { forwardRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  required?: boolean
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, required, className, id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-")

    return (
      <div className="space-y-2">
        <Label htmlFor={inputId} className={required ? "after:content-['*'] after:text-red-500 after:ml-1" : ""}>
          {label}
        </Label>
        <Input
          id={inputId}
          ref={ref}
          className={cn(error && "border-red-500 focus-visible:ring-red-500", className)}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  },
)
InputField.displayName = "InputField"

interface SelectFieldProps {
  label: string
  error?: string
  required?: boolean
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  id?: string
}

export const SelectField = forwardRef<HTMLButtonElement, SelectFieldProps>(
  ({ label, error, required, placeholder, value, onValueChange, children, id }, ref) => {
    const selectId = id || label.toLowerCase().replace(/\s+/g, "-")

    return (
      <div className="space-y-2">
        <Label htmlFor={selectId} className={required ? "after:content-['*'] after:text-red-500 after:ml-1" : ""}>
          {label}
        </Label>
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger
            ref={ref}
            id={selectId}
            className={cn(error && "border-red-500 focus-visible:ring-red-500")}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${selectId}-error` : undefined}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>{children}</SelectContent>
        </Select>
        {error && (
          <p id={`${selectId}-error`} className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  },
)
SelectField.displayName = "SelectField"
