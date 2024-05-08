// Copyright © 2024 Navarrotech

// React.js
import { useEffect, useRef } from 'react';
import BulmaTagsInput from '@creativebulma/bulma-tagsinput';

type Props = {
    value: string[]
    onChange: (value: string[]) => void
    placeholder?: string
    className?: string
    disabled?: boolean
    autoFocus?: boolean
    required?: boolean
    readOnly?: boolean
} & Record<string, any>

// There is something wrong with this bulma-tagsinput package lol

export default function TagsInput({ value, onChange, ...props }: Props){
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!inputRef.current){
            return;
        }

        const tagsInput = new BulmaTagsInput(
            inputRef.current,
            {
                allowDuplicates: false,
                caseSensitive: false,
                allowSpaces: true,
                allowCommas: true,
                addOnBlur: true,
                addOnEnter: true,
                addOnPaste: true,
                addKeys: [13, 9, 188],
                removeKeys: [8],
                maxTags: 0,
                maxChars: 0,
                placeholder: '',
                closeDropdownOnItemSelect: false,
                highlightOnExistColor: '#000',
                highlightColor: '#000',
                onlyItem: false,
                freeInput: true
            }
        );

        tagsInput.on('after.add', ({ item }: { item: string | BulmaTagsInputItem }) => {
            onChange([...value, item]);
        });

        tagsInput.on('after.remove', ({ item }: { item: string | BulmaTagsInputItem }) => {
            onChange(value.filter((tag) => tag !== item));
        });

        return () => {
            tagsInput.destroy();
        };
    }, [value, onChange]);

    return <input
        { ...props }
        ref={inputRef}
        type="text"
    />;
}