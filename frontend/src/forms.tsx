import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import { Button } from './components/ui/button';
import type { Program, User } from './types';
const studentSchema = z.object({
  email: z.email('Enter a valid email.'),
  full_name: z.string().min(2, 'Enter a full name.'),
  date_of_birth: z
    .string()
    .min(1, 'Date of birth is required.')
    .refine((v) => new Date(v) <= new Date(), 'Date cannot be in the future.'),
  gender: z.string().min(1, 'Select a gender.'),
  mobile_number: z
    .string()
    .regex(
      /^\+?[1-9]\d{9,14}$/,
      'Enter a valid phone number, including country code if applicable.',
    ),
  institution_name: z.string().min(1, 'Institution is required.'),
  course_or_class: z.string().min(1, 'Course is required.'),
});
type StudentFields = z.infer<typeof studentSchema>;
export function StudentForm({
  onDone,
  student,
}: {
  onDone: () => void;
  student?: User;
}) {
  const client = useQueryClient();
  const form = useForm<StudentFields>({
    resolver: zodResolver(studentSchema),
    defaultValues: student
      ? { email: student.email, ...student.profile }
      : undefined,
  });
  const {
    register,
    formState: { errors, isSubmitting },
  } = form;
  return (
    <form
      onSubmit={form.handleSubmit(async ({ email, ...profile }) => {
        try {
          const result = await api(
            student ? `admin/students/${student.id}` : 'admin/students',
            student ? 'PATCH' : 'POST',
            { email, profile },
          );
          await client.invalidateQueries();
          if (!student && result.meta.invitation_sent === false) {
            toast.warning(
              'Student registered, but email delivery failed. Retry the invitation from the student profile.',
            );
          } else {
            toast.success(
              student
                ? 'Student updated'
                : 'Student registered. A password setup email has been sent.',
            );
          }
          onDone();
        } catch (e) {
          form.setError('root', { message: (e as Error).message });
        }
      })}
    >
      <div className="form-grid">
        {[
          ['full_name', 'Full name', 'text'],
          ['email', 'Email address', 'email'],
          ['date_of_birth', 'Date of birth', 'date'],
          ['mobile_number', 'Mobile number', 'tel'],
          ['institution_name', 'Institution', 'text'],
          ['course_or_class', 'Course / class', 'text'],
        ].map(([key, label, type]) => (
          <label key={key}>
            {label}
            <input
              type={type}
              readOnly={!!student && key === 'email'}
              {...register(key as keyof StudentFields)}
            />
            {errors[key as keyof StudentFields] && (
              <small className="field-error">
                {errors[key as keyof StudentFields]?.message}
              </small>
            )}
          </label>
        ))}
        <label>
          Gender
          <select {...register('gender')}>
            <option value="">Select gender</option>
            {['Male', 'Female', 'Other', 'Prefer not to say'].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
          {errors.gender && (
            <small className="field-error">{errors.gender.message}</small>
          )}
        </label>
      </div>
      {!student && (
        <div className="form-note">
          A secure, single-use password setup link will be emailed to the
          student. Their account activates after setup.
        </div>
      )}
      {errors.root && (
        <p role="alert" className="form-error">
          {errors.root.message}
        </p>
      )}
      <div className="form-actions">
        <Button variant="outline" type="button" onClick={onDone}>
          Cancel
        </Button>
        <Button disabled={isSubmitting}>
          {isSubmitting
            ? 'Saving…'
            : student
              ? 'Save changes'
              : 'Register & send invitation'}
        </Button>
      </div>
    </form>
  );
}
const programSchema = z
  .object({
    title: z.string().min(3, 'Enter a program title.'),
    short_description: z.string().min(1, 'Add a short description.'),
    description: z.string(),
    eligibility_criteria: z.string().min(1, 'Specify eligibility criteria.'),
    location: z.string().min(1, 'Location is required.'),
    start_date: z.string().min(1, 'Start date is required.'),
    end_date: z.string().min(1, 'End date is required.'),
    capacity: z
      .string()
      .refine(
        (v) => v === '' || (/^\d+$/.test(v) && Number(v) > 0),
        'Enter a positive capacity.',
      )
      .transform((v) => (v === '' ? null : Number(v))),
  })
  .refine((v) => v.end_date >= v.start_date, {
    message: 'End date must follow start date.',
    path: ['end_date'],
  });
type ProgramInput = z.input<typeof programSchema>;
export function ProgramForm({
  onDone,
  program,
}: {
  onDone: () => void;
  program?: Program;
}) {
  const client = useQueryClient();
  const form = useForm<ProgramInput, unknown, z.output<typeof programSchema>>({
    resolver: zodResolver(programSchema),
    defaultValues: program
      ? { ...program, capacity: String(program.capacity || '') }
      : undefined,
  });
  const {
    register,
    formState: { errors, isSubmitting },
  } = form;
  return (
    <form
      onSubmit={form.handleSubmit(async (values) => {
        try {
          await api(
            program ? `admin/programs/${program.id}` : 'admin/programs',
            program ? 'PATCH' : 'POST',
            { program: values },
          );
          await client.invalidateQueries();
          toast.success(program ? 'Program updated' : 'Draft program created');
          onDone();
        } catch (e) {
          form.setError('root', { message: (e as Error).message });
        }
      })}
    >
      <div className="form-grid">
        {[
          ['title', 'Program title', 'text'],
          ['location', 'Camp location', 'text'],
          ['start_date', 'Start date', 'date'],
          ['end_date', 'End date', 'date'],
          ['capacity', 'Maximum cadets (optional)', 'number'],
        ].map(([key, label, type]) => (
          <label key={key}>
            {label}
            <input type={type} {...register(key as keyof ProgramInput)} />
            {errors[key as keyof ProgramInput] && (
              <small className="field-error">
                {errors[key as keyof ProgramInput]?.message}
              </small>
            )}
          </label>
        ))}
      </div>
      {[
        ['short_description', 'Short description'],
        ['description', 'Full description'],
        ['eligibility_criteria', 'Eligibility requirements'],
      ].map(([key, label]) => (
        <label key={key}>
          {label}
          <textarea
            rows={key === 'description' ? 3 : 2}
            {...register(key as keyof ProgramInput)}
          />
          {errors[key as keyof ProgramInput] && (
            <small className="field-error">
              {errors[key as keyof ProgramInput]?.message}
            </small>
          )}
        </label>
      ))}
      {errors.root && (
        <p role="alert" className="form-error">
          {errors.root.message}
        </p>
      )}
      <div className="form-actions">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button disabled={isSubmitting}>
          {isSubmitting
            ? 'Saving…'
            : program
              ? 'Save changes'
              : 'Create draft program'}
        </Button>
      </div>
    </form>
  );
}
