import { authOptions } from '@/server/auth/nextauth'
import NextAuth from 'next-auth'

export default NextAuth(authOptions)
