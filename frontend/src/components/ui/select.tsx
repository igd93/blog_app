import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Create a context for the select state
type SelectContextType = {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const SelectContext = createContext<SelectContextType | undefined>(undefined);

// Select component
interface SelectProps {
  children: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  defaultValue?: string;
}

const Select: React.FC<SelectProps> = ({
  children,
  value,
  onValueChange,
  defaultValue,
}) => {
  const [open, setOpen] = useState(false);

  // Initialize with default value if provided
  useEffect(() => {
    if (defaultValue && !value) {
      onValueChange(defaultValue);
    }
  }, [defaultValue, value, onValueChange]);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      {children}
    </SelectContext.Provider>
  );
};

// Hook to use select context
const useSelectContext = () => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error("Select components must be used within a Select");
  }
  return context;
};

// Select trigger component
interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

const SelectTrigger: React.FC<SelectTriggerProps> = ({
  children,
  className,
}) => {
  const { open, setOpen } = useSelectContext();

  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
};

// Select value component
interface SelectValueProps {
  placeholder?: string;
}

const SelectValue: React.FC<SelectValueProps> = ({ placeholder }) => {
  const { value } = useSelectContext();

  return (
    <span className="text-sm">
      {value || placeholder || "Select an option"}
    </span>
  );
};

// Select content component
interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
  position?: string;
}

const SelectContent: React.FC<SelectContentProps> = ({
  children,
  className,
  position = "popper",
}) => {
  const { open, setOpen } = useSelectContext();
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80",
        position === "popper" && "translate-y-1",
        className
      )}
    >
      <div className="p-1">{children}</div>
    </div>
  );
};

// Select item component
interface SelectItemProps {
  children: React.ReactNode;
  className?: string;
  value: string;
}

const SelectItem: React.FC<SelectItemProps> = ({
  children,
  className,
  value: itemValue,
}) => {
  const { value, onValueChange, setOpen } = useSelectContext();
  const isSelected = value === itemValue;

  const handleSelect = () => {
    onValueChange(itemValue);
    setOpen(false);
  };

  return (
    <button
      type="button"
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      onClick={handleSelect}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4" />}
      </span>
      {children}
    </button>
  );
};

// Select group component (simple wrapper)
interface SelectGroupProps {
  children: React.ReactNode;
}

const SelectGroup: React.FC<SelectGroupProps> = ({ children }) => {
  return <div className="p-1">{children}</div>;
};

// Select separator component
interface SelectSeparatorProps {
  className?: string;
}

const SelectSeparator: React.FC<SelectSeparatorProps> = ({ className }) => {
  return <div className={cn("-mx-1 my-1 h-px bg-muted", className)} />;
};

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectSeparator,
};
