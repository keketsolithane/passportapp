import { NextResponse } from 'next/server';
import { supabase } from "../../../../lib/supabase";

export async function GET(request, { params }) {
  try {
    const { ref } = params;

    console.log('🔍 API: Looking for reference in database:', ref);

    if (!ref || ref.trim() === '') {
      return NextResponse.json(
        { error: 'Reference number is required' },
        { status: 400 }
      );
    }

    const cleanReference = ref.trim();

    // Query the database for the application
    const { data, error } = await supabase
      .from('passport_applications')
      .select('*')
      .eq('reference', cleanReference)
      .single();

    if (error) {
      console.error('Database error:', error);
      
      if (error.code === 'PGRST116') { // No rows found
        // Get some sample references for debugging
        const { data: sampleRefs } = await supabase
          .from('passport_applications')
          .select('reference')
          .limit(5);
        
        return NextResponse.json(
          { 
            error: 'Application not found with this reference number',
            debug: {
              searchedFor: cleanReference,
              availableReferences: sampleRefs?.map(r => r.reference) || [],
              totalApplications: sampleRefs?.length || 0
            }
          },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Database error: ' + error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Return the actual application data from database
    const responseData = {
      reference: data.reference,
      full_name: data.full_name,
      email: data.email,
      id_number: data.id_number,
      nationality: data.nationality,
      district: data.district,
      passport_type: data.passport_type,
      status: data.status || 'Processing',
      message: getStatusMessage(data.status),
      last_updated: data.updated_at || data.created_at,
      submitted_at: data.created_at,
      // Include additional fields you want to display
      birth_place: data.birth_place,
      head_chief: data.head_chief,
      sex: data.sex,
      guardian_name: data.guardian_name,
      guardian_id: data.guardian_id
    };

    console.log('✅ API: Found application in database:', responseData.reference);

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('🚨 API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

function getStatusMessage(status) {
  const messages = {
    'Processing': 'Your application is being processed. Please check back later for updates.',
    'Under Review': 'Your application is under review by our team.',
    'Approved': 'Your application has been approved. Your passport will be ready soon.',
    'Rejected': 'Your application has been rejected. Please contact support for more information.',
    'Ready for Pickup': 'Your passport is ready for pickup at the designated office.',
    'Dispatched': 'Your passport has been dispatched for delivery.',
    'Completed': 'Your passport application has been completed.'
  };
  
  return messages[status] || 'Your application is being processed.';
}