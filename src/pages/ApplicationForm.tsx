import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/PageContainer';
import applicationApi, {
  JobApplication,
  JobApplicationCreateDTO,
  JobApplicationUpdateDTO
} from '@/api/applicationsApi';
import { format, formatISO, parseISO } from 'date-fns';

type Status = 'applied' | 'interviewing' | 'assesment' | 'rejected' | 'offered' | 'accepted' | 'declined';

interface ApplicationFormData extends JobApplicationCreateDTO {
  applied_date: string;
  deadline_date?: string;
}

const ApplicationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const [formData, setFormData] = useState<ApplicationFormData>({
    job_title: '',
    company: '',
    status: 'applied',
    applied_date: formatISO(new Date(), { representation: 'date' }),
    deadline_date: '',
    notes: '',
    application_url: '',
    location: '',
    salary: '',
    job_description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const checkAuth = () => {
      if (sessionStorage.getItem('isAuthenticated') !== 'true') {
        navigate('/login');
        return false;
      }
      return true;
    };

    const loadApplication = async () => {
      if (!id || !checkAuth()) return;

      setIsFetching(true);
      try {
        const application = await applicationApi.get(id);
        if (application) {
          setFormData({
            job_title: application.job_title,
            company: application.company,
            status: application.status as Status,
            applied_date: formatISO(parseISO(application.applied_date), { representation: 'date' }),
            deadline_date: application.deadline_date
              ? formatISO(parseISO(application.deadline_date), { representation: 'date' })
              : '',
            notes: application.notes || '',
            application_url: application.application_url || '',
            location: application.location || '',
            salary: application.salary || '',
            job_description: application.job_description || '',
          });
        }
      } catch (error) {
        toast.error('Failed to load application');
        navigate('/applications', { replace: true });
      } finally {
        setIsFetching(false);
      }
    };

    if (isEditMode) loadApplication();
  }, [id, isEditMode, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => {
      // Clear deadline_date if status is changed away from interview/assesment
      if (name === 'status' && !['interviewing', 'assesment'].includes(value)) {
        return { ...prev, [name]: value, deadline_date: '' };
      }

      return { ...prev, [name]: value };
    });

    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.company.trim()) newErrors.company = 'Company name is required';
    if (!formData.job_title.trim()) newErrors.job_title = 'Position is required';
    if (!formData.applied_date) newErrors.applied_date = 'Date is required';

    if (formData.application_url && !isValidUrl(formData.application_url)) {
      newErrors.application_url = 'Invalid URL format';
    }
    if ((formData.status === 'interviewing' || formData.status === 'assesment') && !formData.deadline_date) {
      newErrors.deadline_date = 'Deadline is required for interview or assessment status';
    }

    if (formData.deadline_date && new Date(formData.deadline_date) < new Date(formData.applied_date)) {
      newErrors.deadline_date = 'Deadline date cannot be before applied date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const payload: JobApplicationCreateDTO | JobApplicationUpdateDTO = {
        job_title: formData.job_title,
        company: formData.company,
        status: formData.status,
        applied_date: new Date(formData.applied_date).toISOString(),
        deadline_date: formData.deadline_date
          ? format(new Date(formData.deadline_date), 'yyyy-MM-dd')
          : undefined,
        notes: formData.notes,
        application_url: formData.application_url,
        location: formData.location,
        salary: formData.salary,
        job_description: formData.job_description,
      };

      console.log(payload);
      if (isEditMode && id) {
        await applicationApi.update(id, payload as any);
        toast.success('Application updated successfully!');
        navigate("/applications");
      } else {
        const response: any = await applicationApi.create(payload as any);
        console.log("Response to post app", response)
        if (response.error) {
          toast.error(response.error)
          return;
        }
        toast.success('Application created successfully!');
        navigate("/applications");
      }
      // navigate('/applications');
    } catch (error: any) {
      console.log(error.response)
      const message = error.response?.data?.error || 'Failed to save application. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-EncryptEase-600"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="app-container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit Job Application' : 'Add Job Application'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditMode
              ? 'Update the details of your job application.'
              : 'Track a new job application by filling out the form below.'}
          </p>
        </div>

        <div className="glass-card p-6 md:p-8 animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Field */}
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name*
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className={`form-input ${errors.company ? 'border-red-500' : ''}`}
                  placeholder="e.g. Google, Microsoft, etc."
                />
                {errors.company && <p className="mt-1 text-sm text-red-600">{errors.company}</p>}
              </div>

              {/* Job Title Field */}
              <div>
                <label htmlFor="job_title" className="block text-sm font-medium text-gray-700 mb-1">
                  Position Title*
                </label>
                <input
                  type="text"
                  id="job_title"
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleChange}
                  className={`form-input ${errors.job_title ? 'border-red-500' : ''}`}
                  placeholder="e.g. Frontend Developer, UX Designer, etc."
                />
                {errors.job_title && <p className="mt-1 text-sm text-red-600">{errors.job_title}</p>}
              </div>

              {/* Status Field */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Application Status*
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="applied">Applied</option>
                  <option value="interviewing">Interview</option>
                  <option value="offered">Offer Received</option>
                  <option value="assesment">Assesment</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="declined">Declined</option>
                </select>
              </div>

              {/* Application Date Field */}
              <div>
                <label htmlFor="applied_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Application Date*
                </label>
                <input
                  type="date"
                  id="applied_date"
                  name="applied_date"
                  value={formData.applied_date}
                  onChange={handleChange}
                  className={`form-input ${errors.applied_date ? 'border-red-500' : ''}`}
                  max={formatISO(new Date(), { representation: 'date' })}
                />
                {errors.applied_date && <p className="mt-1 text-sm text-red-600">{errors.applied_date}</p>}
              </div>

              {/* Deadline Date Field */}
              {(formData.status === 'interviewing' || formData.status === 'assesment') && (
                <div>
                  <label htmlFor="deadline_date" className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline Date
                  </label>
                  <input
                    type="date"
                    id="deadline_date"
                    name="deadline_date"
                    value={formData.deadline_date || ''}
                    onChange={handleChange}
                    className={`form-input ${errors.deadline_date ? 'border-red-500' : ''}`}
                  />
                  {errors.deadline_date && <p className="mt-1 text-sm text-red-600">{errors.deadline_date}</p>}
                </div>
              )}
              {/* Application URL Field */}
              <div>
                <label htmlFor="application_url" className="block text-sm font-medium text-gray-700 mb-1">
                  Job Posting URL
                </label>
                <input
                  type="url"
                  id="application_url"
                  name="application_url"
                  value={formData.application_url}
                  required
                  onChange={handleChange}
                  className={`form-input ${errors.application_url ? 'border-red-500' : ''}`}
                  placeholder="https://..."
                />
                {errors.application_url && <p className="mt-1 text-sm text-red-600">{errors.application_url}</p>}
              </div>

              {/* Location Field */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g. New York, NY"
                />
              </div>

              {/* Salary Field */}
              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">
                  Salary
                </label>
                <input
                  type="text"
                  id="salary"
                  name="salary"
                  value={formData.salary}
                  required
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g. $120,000 - $150,000"
                />
              </div>
            </div>

            {/* Job Description Field */}
            <div>
              <label htmlFor="job_description" className="block text-sm font-medium text-gray-700 mb-1">
                Job Description
              </label>
              <textarea
                id="job_description"
                name="job_description"
                rows={4}
                value={formData.job_description}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Paste job description here..."
              />
            </div>

            {/* Notes Field */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                value={formData.notes}
                onChange={handleChange}
                className="form-input"
                placeholder="Add private notes about this application..."
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/applications')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? isEditMode ? "Updating..." : "Saving..."
                  : isEditMode ? "Update Application" : "Add Application"
                }
              </Button>
            </div>
          </form>
        </div>
      </div>
    </PageContainer>
  );
};

export default ApplicationForm;