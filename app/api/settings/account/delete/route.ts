import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id

    // Delete related data in correct order
    // The database schema uses CASCADE DELETE for most tables:
    // - auth.users CASCADE to profiles, user_subscriptions, payments, etc.
    // - profiles CASCADE to ideas, instagram_accounts
    // - ideas CASCADE to idea_platforms
    // - idea_platforms CASCADE to metrics
    // - instagram_accounts CASCADE to instagram_posts

    // Delete profile first (this will CASCADE to ideas, instagram_accounts, and their children)
    const { error: profileDeleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileDeleteError) {
      console.error('Error deleting profile:', profileDeleteError)
      // Continue with user deletion even if profile delete fails
    }

    // Delete auth user (this will CASCADE to remaining tables like
    // notifications, google_drive_accounts, oauth_states, etc.)
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(userId)

    if (deleteUserError) {
      console.error('Error deleting user:', deleteUserError)
      // Even if admin delete fails, try to sign out
      await supabase.auth.signOut()
      return NextResponse.json(
        {
          success: true,
          message: 'Account data deleted. Please contact support if you still have access.',
        },
        { status: 200 }
      )
    }

    // Sign out the user
    await supabase.auth.signOut()

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    })
  } catch (error) {
    console.error('Error in account deletion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
