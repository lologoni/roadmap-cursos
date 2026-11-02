import { z } from 'zod'

// Espejo de las validaciones de BackendSchema §3.1
const PATRON_EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

const email = z
  .string()
  .trim()
  .min(1, 'Ingresá tu email.')
  .max(254, 'Debe tener como máximo 254 caracteres.')
  .regex(PATRON_EMAIL, 'El email no tiene un formato válido.')

const passwordNueva = z
  .string()
  .min(10, 'Debe tener al menos 10 caracteres.')
  .max(128, 'Debe tener como máximo 128 caracteres.')

export const esquemaLogin = z.object({
  email: z.string().trim().min(1, 'Ingresá tu email.'),
  password: z.string().min(1, 'Ingresá tu contraseña.'),
})

export const esquemaRegistro = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(2, 'Debe tener al menos 2 caracteres.')
      .max(80, 'Debe tener como máximo 80 caracteres.'),
    email,
    password: passwordNueva,
  })
  .refine((datos) => datos.password.trim().toLowerCase() !== datos.email.toLowerCase(), {
    path: ['password'],
    message: 'La contraseña no puede ser igual al email.',
  })

export const esquemaRecuperar = z.object({ email })

export const esquemaRestablecer = z
  .object({
    password_nueva: passwordNueva,
    repetir: z.string().min(1, 'Repetí la contraseña.'),
  })
  .refine((datos) => datos.password_nueva === datos.repetir, {
    path: ['repetir'],
    message: 'Las contraseñas no coinciden.',
  })
