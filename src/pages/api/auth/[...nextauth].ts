import NextAuth from 'next-auth'
import { authOptions } from '@/server/auth/nextauth'

export default NextAuth(authOptions)
