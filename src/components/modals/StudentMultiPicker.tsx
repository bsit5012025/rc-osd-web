import { useEffect, useRef, useState } from "react";

import type { Student } from "../../services/studentApi";

import "./SearchableDropdown.css";
import "./StudentMultiPicker.css";

interface StudentMultiPickerProps {
    id?: string;
    students: Student[];
    selectedIds: string[];
    onChange: (ids: string[]) => void;
    loading?: boolean;
    disabled?: boolean;
}

const MAX_RESULTS = 8;

const fullName = (s: Student) => {
    const { firstName, middleName, lastName } = s.person;
    const middle = middleName ? ` ${middleName.charAt(0)}.` : "";
    return `${lastName}, ${firstName}${middle}`;
};

function StudentMultiPicker({
    id,
    students,
    selectedIds,
    onChange,
    loading = false,
    disabled = false,
}: StudentMultiPickerProps) {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const q = query.trim().toLowerCase();

    const matches = students
        .filter((s) => !selectedIds.includes(s.studentId))
        .filter((s) =>
            q === "" ||
            s.studentId.toLowerCase().includes(q) ||
            `${s.person.firstName} ${s.person.lastName}`.toLowerCase().includes(q) ||
            `${s.person.lastName} ${s.person.firstName}`.toLowerCase().includes(q)
        );

    const shown = matches.slice(0, MAX_RESULTS);

    const selectedStudents = selectedIds.map(
        (sid) => students.find((s) => s.studentId === sid) ?? null
    );

    const add = (studentId: string) => {
        onChange([...selectedIds, studentId]);
        setQuery("");
    };

    const remove = (studentId: string) => {
        onChange(selectedIds.filter((sid) => sid !== studentId));
    };

    return (
        <div className="student-multi-picker" ref={containerRef}>
            {selectedIds.length > 0 && (
                <div className="student-chip-list">
                    {selectedIds.map((sid, i) => {
                        const student = selectedStudents[i];
                        return (
                            <span className="student-chip" key={sid}>
                                {student ? fullName(student) : sid}
                                <small>{sid}</small>
                                <button
                                    type="button"
                                    onClick={() => remove(sid)}
                                    disabled={disabled}
                                    aria-label={`Remove ${sid}`}
                                >
                                    <i className="bi bi-x"></i>
                                </button>
                            </span>
                        );
                    })}
                </div>
            )}

            <div className="searchable-dropdown">
                <input
                    id={id}
                    type="text"
                    className="form-control new-request-select searchable-dropdown-input"
                    placeholder={loading ? "Loading students..." : "Search by student name or ID"}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    disabled={disabled || loading}
                    autoComplete="off"
                />
                <i className="bi bi-search searchable-dropdown-caret"></i>

                {isOpen && !loading && (
                    <ul className="searchable-dropdown-list" role="listbox">
                        {shown.length > 0 ? (
                            <>
                                {shown.map((s) => (
                                    <li
                                        key={s.studentId}
                                        role="option"
                                        aria-selected={false}
                                        className="searchable-dropdown-option"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            add(s.studentId);
                                        }}
                                    >
                                        {fullName(s)}
                                        <span className="student-option-id">{s.studentId}</span>
                                    </li>
                                ))}
                                {matches.length > MAX_RESULTS && (
                                    <li className="searchable-dropdown-empty">
                                        {matches.length - MAX_RESULTS} more — keep typing to narrow down
                                    </li>
                                )}
                            </>
                        ) : (
                            <li className="searchable-dropdown-empty">No matching student found</li>
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default StudentMultiPicker;
