import { useState } from "react";
import { Form, Button, Container, Row, Col, FormCheck } from "react-bootstrap";
import { quarterRange } from "main/utils/quarterUtilities";
import { useSystemInfo } from "main/utils/systemInfo";
import SingleQuarterDropdown from "../Quarters/SingleQuarterDropdown";

const CourseOverTimeDescriptionSearchForm = ({ fetchJSON }) => {
  const { data: systemInfo } = useSystemInfo();

  const firstQtr = systemInfo.startQtrYYYYQ || "20211";
  const lastQtr = systemInfo.endQtrYYYYQ || "20214";

  const quarters = quarterRange(firstQtr, lastQtr);

  const localStartQuarter = localStorage.getItem(
    "CourseOverTimeDescriptionSearch.StartQuarter",
  );
  const localEndQuarter = localStorage.getItem(
    "CourseOverTimeDescriptionSearch.EndQuarter",
  );
  const localSearchTerms = localStorage.getItem(
    "CourseOverTimeDescriptionSearch.SearchTerms",
  );
  const localStorageCheckbox =
    localStorage.getItem("CourseOverTimeDescriptionSearch.Checkbox") === "true";

  const [startQuarter, setStartQuarter] = useState(
    localStartQuarter || firstQtr,
  );
  const [endQuarter, setEndQuarter] = useState(localEndQuarter || lastQtr);
  const [searchTerms, setSearchTerms] = useState(localSearchTerms || "");
  const [checkbox, setCheckbox] = useState(localStorageCheckbox || false);

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchJSON(event, { startQuarter, endQuarter, searchTerms, checkbox });
  };

  const handleSearchTermsOnChange = (event) => {
    setSearchTerms(event.target.value);
    localStorage.setItem(
      "CourseOverTimeDescriptionSearch.SearchTerms",
      event.target.value,
    );
  };

  const handleCheckboxOnChange = (event) => {
    setCheckbox(event.target.checked);
    localStorage.setItem(
      "CourseOverTimeDescriptionSearch.Checkbox",
      event.target.checked.toString(),
    );
  };

  const testid = "CourseOverTimeDescriptionSearchForm";

  return (
    <Form onSubmit={handleSubmit} data-testid={testid}>
      <Container>
        <Row className="mb-3">
          <Col>
            <h1>Search Course Descriptions Over Time</h1>
            <p className="text-muted">
              Find courses whose catalog descriptions contain the terms you
              enter. Use the quarter range and Lectures Only filter to narrow
              the results.
            </p>
          </Col>
        </Row>
        <Row>
          <Col md="auto">
            <SingleQuarterDropdown
              quarters={quarters}
              quarter={startQuarter}
              setQuarter={setStartQuarter}
              controlId={"CourseOverTimeDescriptionSearch.StartQuarter"}
              label={"Start Quarter"}
            />
          </Col>
          <Col md="auto">
            <SingleQuarterDropdown
              quarters={quarters}
              quarter={endQuarter}
              setQuarter={setEndQuarter}
              controlId={"CourseOverTimeDescriptionSearch.EndQuarter"}
              label={"End Quarter"}
            />
          </Col>
        </Row>
        <Form.Group controlId="CourseOverTimeDescriptionSearch.SearchTerms">
          <Form.Label>Search Terms</Form.Label>
          <Form.Control
            onChange={handleSearchTermsOnChange}
            defaultValue={searchTerms}
          />
        </Form.Group>
        <Form.Group controlId="CourseOverTimeDescriptionSearch.Checkbox">
          <FormCheck
            data-testid={`${testid}-checkbox`}
            label="Lectures Only"
            onChange={handleCheckboxOnChange}
            checked={checkbox}
          />
        </Form.Group>
        <Row
          data-testid={`${testid}-bottom-row`}
          style={{ paddingTop: 10, paddingBottom: 10 }}
        >
          <Col md="auto">
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Col>
        </Row>
      </Container>
    </Form>
  );
};

export default CourseOverTimeDescriptionSearchForm;
