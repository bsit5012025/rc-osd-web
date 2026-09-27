import { useEffect, useRef, useState, ChangeEvent, KeyboardEvent } from "react";

import "./SearchableDropdown.css";

interface SearchableDropdownProps {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder?: string;
    loading?: boolean;
    disabled?: boolean;
    emptyLabel?: string;
}

function SearchableDropdown({
    id,
    value,
    onChange,
    options,
    placeholder,
    loading = false,
    disabled = false,
    emptyLabel = "No matches found",
}: SearchableDropdownProps) {
    const [query, setQuery] = useState(value);
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);

    // Keep the visible text in sync when the value is changed from outside
    // (e.g. the parent resets it when Request Scope changes).
    useEffect(() => {
        setQuery(value);
    }, [value]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setQuery(value);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [value]);

    const filteredOptions = options.filter((opt) =>
        opt.toLowerCase().includes(query.trim().toLowerCase())
    );

    const handleSelect = (option: string) => {
        onChange(option);
        setQuery(option);
        setIsOpen(false);
        setHighlightedIndex(-1);
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setQuery(newValue);
        onChange(newValue);
        setIsOpen(true);
        setHighlightedIndex(-1);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen && (e.key === "ArrowDown" || e.key === "Enter")) {
            setIsOpen(true);
            return;
        }
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
                handleSelect(filteredOptions[highlightedIndex]);
            } else {
                setIsOpen(false);
            }
        } else if (e.key === "Escape") {
            setIsOpen(false);
            setQuery(value);
        }
    };

    return (
        <div className="searchable-dropdown" ref={containerRef}>
            <input
                id={id}
                type="text"
                className="form-control new-request-select searchable-dropdown-input"
                placeholder={loading ? "Loading options..." : placeholder}
                value={query}
                onChange={handleInputChange}
                onFocus={() => setIsOpen(true)}
                onKeyDown={handleKeyDown}
                disabled={disabled || loading}
                autoComplete="off"
                role="combobox"
                aria-expanded={isOpen}
                aria-autocomplete="list"
            />
            <i className="bi bi-chevron-down searchable-dropdown-caret"></i>

            {isOpen && !loading && (
                <ul className="searchable-dropdown-list" role="listbox">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option, index) => (
                            <li
                                key={option}
                                role="option"
                                aria-selected={option === value}
                                className={`searchable-dropdown-option ${
                                    index === highlightedIndex ? "highlighted" : ""
                                } ${option === value ? "selected" : ""}`}
                                onMouseDown={(e) => {
                                    // preventDefault so the input doesn't lose focus/blur before the click registers
                                    e.preventDefault();
                                    handleSelect(option);
                                }}
                                onMouseEnter={() => setHighlightedIndex(index)}
                            >
                                {option}
                            </li>
                        ))
                    ) : (
                        <li className="searchable-dropdown-empty">{emptyLabel}</li>
                    )}
                </ul>
            )}
        </div>
    );
}

export default SearchableDropdown;