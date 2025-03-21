"use client";

import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../../lib/supabase/client";

export default function EditDealerPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    status: "active",
    website_url: "",
    notes: ""
  });

  useEffect(() => {
    const fetchDealer = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('dealers')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        
        if (data) {
          setFormData({
            name: data.name || "",
            status: data.status || "active",
            website_url: data.website_url || "",
            notes: data.notes || ""
          });
        }
      } catch (error) {
        console.error("Error fetching dealer:", error);
        alert("Failed to load dealer information. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDealer();
  }, [params.id, supabase]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.name || !formData.website_url) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      // Update dealer
      const { error } = await supabase
        .from('dealers')
        .update({
          name: formData.name,
          website_url: formData.website_url,
          status: formData.status,
          notes: formData.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id);

      if (error) throw error;

      // Redirect to dealers page
      router.push('/dashboard/dealers');
    } catch (error) {
      console.error("Error updating dealer:", error);
      alert("Failed to update dealer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Link
            href="/dashboard/dealers"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dealers
          </Link>
        </div>
        <div className="text-center py-10">
          <p>Loading dealer information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/dealers"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dealers
        </Link>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight">Edit Dealer</h2>
        <p className="text-muted-foreground">
          Update dealer information
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <div className="px-4 py-6 sm:p-8">
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                Dealer Name
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  placeholder="e.g. ABC Motors"
                  required
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="status" className="block text-sm font-medium leading-6 text-gray-900">
                Status
              </label>
              <div className="mt-2">
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:max-w-xs sm:text-sm sm:leading-6"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="website_url" className="block text-sm font-medium leading-6 text-gray-900">
                Website URL
              </label>
              <div className="mt-2">
                <input
                  type="url"
                  name="website_url"
                  id="website_url"
                  value={formData.website_url}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  placeholder="https://example.com"
                  required
                />
              </div>
            </div>

            <div className="col-span-full">
              <label htmlFor="notes" className="block text-sm font-medium leading-6 text-gray-900">
                Notes
              </label>
              <div className="mt-2">
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  placeholder="Add any additional information here"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
          <Link
            href="/dashboard/dealers"
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? (
              "Saving..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 