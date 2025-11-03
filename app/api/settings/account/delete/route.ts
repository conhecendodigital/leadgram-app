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

    // Delete related data (cascade delete based on database schema)
    // Note: Make sure your database has proper CASCADE DELETE set up

    // Delete ideas
    await supabase.from('ideas').delete().eq('user_id', userId)

    // Delete Instagram accounts
    await supabase.from('instagram_accounts').delete().eq('user_id', userId)

    // Delete metrics
    await supabase.from('metrics').delete().eq('user_id', userId)

    // Delete profile
    await supabase.from('profiles').delete().eq('id', userId)

    // Delete auth user (this should be done last)
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
