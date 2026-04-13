import React from 'react';

interface OptionCardProps {
    id: string;
    name: string;
    value: string;
    label: string;
    sublabel?: string;
    price?: string;
    icon?: React.ReactNode;
    isSelected: boolean;
    onChange: (value: string) => void;
    children?: React.ReactNode;
}

export const OptionCard: React.FC<OptionCardProps> = ({
    id,
    name,
    value,
    label,
    sublabel,
    price,
    icon,
    isSelected,
    onChange,
    children
}) => {
    return (
        <label
            htmlFor={id}
            className={`
        flex items-start justify-between p-4 cursor-pointer border-b border-[#e5e5e5] last:border-b-0
        transition-colors duration-200
        ${isSelected ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}
      `}
        >
            <div className="flex items-start gap-3 flex-1">
                {/* Custom Radio Button */}
                <input
                    type="radio"
                    id={id}
                    name={name}
                    value={value}
                    checked={isSelected}
                    onChange={() => onChange(value)}
                    className="mt-0.5"
                />

                {/* Icon (optional) */}
                {icon && <div className="flex-shrink-0 mt-0.5">{icon}</div>}

                {/* Content */}
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="text-[14px] font-medium text-[#111]">{label}</span>
                    </div>
                    {sublabel && (
                        <span className="text-[11px] text-gray-500 block mt-0.5">{sublabel}</span>
                    )}

                    {/* Expandable Content (for Stripe PaymentElement) */}
                    {isSelected && children && (
                        <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
                            {children}
                        </div>
                    )}
                </div>
            </div>

            {/* Price */}
            {price && (
                <span className="font-medium text-[#111] text-[14px] ml-4">{price}</span>
            )}
        </label>
    );
};
