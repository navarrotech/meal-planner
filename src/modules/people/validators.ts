// Copyright © 2026 Navarrotech

import * as yup from 'yup'

export const personSchema = yup
    .object({
        id: yup
            .string()
            .required(),

        name: yup
            .string()
            .typeError("Name must be a string")
            .min(1, "A person needs a name")
            .max(32, "A name must be at most 32 characters")
            .required(),

        color: yup
            .string()
            .typeError("Colour must be a string")
            .matches(/^#[0-9a-fA-F]{6}$/, "A colour must look like #1AA0BD")
            .required(),
    })
    .noUnknown("Invalid keys provided")
