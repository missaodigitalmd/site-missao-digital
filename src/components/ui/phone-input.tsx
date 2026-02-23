import * as React from "react"
import PhoneInput from "react-phone-number-input"
import 'react-phone-number-input/style.css'
import { cn } from "@/lib/utils"

export interface PhoneInputProps extends Omit<React.ComponentProps<typeof PhoneInput>, "onChange" | "value"> {
    value?: string;
    onChange?: (value: string | undefined) => void;
}

const InternationalPhoneInput = React.forwardRef<React.ElementRef<typeof PhoneInput>, PhoneInputProps>(
    ({ className, defaultCountry = "BR", value, onChange, ...props }, ref) => {
        return (
            <PhoneInput
                ref={ref as any}
                defaultCountry={defaultCountry as any}
                value={value as any}
                onChange={onChange as any}
                className={cn(
                    "flex w-full rounded-md border border-input bg-transparent text-base shadow-xs transition-colors focus-within:ring-[3px] focus-within:ring-ring/50 focus-within:border-ring dark:bg-input/30",
                    "min-h-9 px-3 py-1",
                    // Overriding standard classes
                    "[&_.PhoneInputCountry]:mr-2",
                    "[&_.PhoneInputCountryIcon]:w-6 [&_.PhoneInputCountryIcon]:h-4 [&_.PhoneInputCountryIcon--square]:w-auto [&_.PhoneInputCountryIcon]:shadow-sm",
                    "[&_.PhoneInputInput]:flex-1 [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:border-none [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:text-sm [&_.PhoneInputInput]:text-foreground [&_.PhoneInputInput]:placeholder:text-muted-foreground",
                    // Remover outline focus default do select nativo sobre o country e fixar contraste das opções
                    "[&_.PhoneInputCountrySelect]:outline-none",
                    "[&_option]:bg-surface-primary [&_option]:text-white",
                    className
                )}
                {...props}
            />
        )
    }
)
InternationalPhoneInput.displayName = "InternationalPhoneInput"

export { InternationalPhoneInput }
