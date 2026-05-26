import { useState } from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import CourseOverTimeDescriptionSearchForm from "main/components/BasicCourseSearch/CourseOverTimeDescriptionSearchForm";
import ConvertedSectionTable from "main/components/Common/ConvertedSectionTable";
import { useBackendMutation } from "main/utils/useBackend";

export default function CourseDescriptionIndexPage() {
  // Stryker disable next-line all : Can't test state because hook is internal
  const [courseJSON, setCourseJSON] = useState([]);

  const objectToAxiosParams = (query) => ({
    url: "/api/public/description/search",
    params: {
      startQtr: query.startQuarter,
      endQtr: query.endQuarter,
      searchTerms: query.searchTerms,
      lectureOnly: query.checkbox,
    },
  });

  const onSuccess = (courses) => {
    setCourseJSON(courses);
  };

  const mutation = useBackendMutation(
    objectToAxiosParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    [],
  );

  async function fetchCourseJSON(_event, query) {
    mutation.mutate(query);
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h5>UCSB Courses Description Search</h5>
        <CourseOverTimeDescriptionSearchForm fetchJSON={fetchCourseJSON} />
        <ConvertedSectionTable sections={courseJSON} />
      </div>
    </BasicLayout>
  );
}
