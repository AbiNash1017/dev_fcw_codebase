import supabase from "./supabase"

export const getUserSession = async () => {
    const session = await supabase.auth.getSession()
    if (session.error) {
        throw session.error
    }
    return session.data.session
}
