import { Route } from '../types'
import { Authentication } from '../Services/Authentication'

export const Home: Route = {
    redirect: () => {
        const isLoggedIn = Authentication.isLoggedIn()
        return isLoggedIn ? '/editor' : '/login'
    }
}