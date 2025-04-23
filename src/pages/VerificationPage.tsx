import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi } from '@/api/authApi';
import { PageContainer } from '@/components/layout/PageContainer';

const VerificationPage = () => {
    const { email, otp_code } = useParams<{ email: string, otp_code: string }>();
    console.log(email, otp_code);

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                // Call your API to verify the email address
                const response = await authApi.verifyAccount({ email, otp_code });

                if (response.error) {
                    toast.error(response.error);
                } else {
                    toast.success('Email verified successfully! You can now log in.');
                }
            } catch (error) {
                console.error('Verification error:', error); // Log error for debugging
                toast.error('Verification failed. Please try again later.');
            }
        };

        // Verify email only if both email and otp_code are available
        if (email && otp_code) {
            verifyEmail();
        } else {
            toast.error('Missing email or OTP code.');
        }
    }, [email, otp_code]); // Include otp_code in dependencies

    return (
        <PageContainer>
            <div className="flex justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md animate-fade-in">
                    <div className="glass-card p-8">
                        <h2 className="text-2xl font-bold">Verifying Email...</h2>
                        <p className="mt-2 text-gray-600">Please wait while we verify your email address.</p>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};

export default VerificationPage;