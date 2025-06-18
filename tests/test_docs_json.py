import json
import pytest
import tempfile
import os
from pathlib import Path
from unittest.mock import Mock, patch, mock_open
from typing import Dict, List, Any
import jsonschema
from jsonschema import validate, ValidationError

@pytest.fixture
def sample_docs_json():
    """Sample documentation JSON structure for testing."""
    return {
        "version": "1.0.0",
        "title": "API Documentation",
        "description": "Comprehensive API documentation",
        "sections": [
            {
                "id": "intro",
                "title": "Introduction",
                "content": "Welcome to our API",
                "subsections": []
            },
            {
                "id": "auth",
                "title": "Authentication",
                "content": "API authentication methods",
                "subsections": [
                    {"id": "oauth", "title": "OAuth", "content": "OAuth 2.0 flow"}
                ]
            }
        ],
        "metadata": {
            "created": "2024-01-01T00:00:00Z",
            "updated": "2024-06-01T00:00:00Z",
            "authors": ["John Doe", "Jane Smith"]
        }
    }

@pytest.fixture
def invalid_json_strings():
    """Collection of invalid JSON strings for error testing."""
    return [
        '{"missing_quote: "value"}',
        '{"trailing_comma": "value",}',
        '{"unclosed": "bracket"',
        '{duplicate": "key", "duplicate": "key2"}',
        '{"invalid_unicode": "\\uXXXX"}',
        ''
    ]

@pytest.fixture
def edge_case_json():
    """Edge case JSON structures for testing."""
    return [
        {},  # Empty object
        [],  # Empty array
        {"null_value": None},
        {"empty_string": ""},
        {"nested": {"deeply": {"nested": {"object": "value"}}}},
        {"large_array": list(range(1000))},
        {"unicode": "Hello 世界 🌍"},
        {"special_chars": "!@#$%^&*()[]{}|\\:;\"'<>,.?/~`"}
    ]

class TestDocsJsonValidation:
    """Test suite for JSON documentation validation functionality."""

    def test_valid_json_structure(self, sample_docs_json):
        """Test that valid JSON documentation structure passes validation."""
        assert validate_docs_json(sample_docs_json) is True

    def test_required_fields_validation(self):
        """Test validation of required fields in documentation JSON."""
        minimal_valid = {"version": "1.0.0", "title": "Test Doc"}
        assert validate_docs_json(minimal_valid) is True

        invalid_cases = [
            {},  # Empty
            {"title": "Test Doc"},  # Missing version
            {"version": "1.0.0"}   # Missing title
        ]
        for invalid_json in invalid_cases:
            with pytest.raises(ValidationError):
                validate_docs_json(invalid_json, strict=True)

    def test_version_format_validation(self):
        """Test semantic version format validation."""
        valid_versions = ["1.0.0", "2.1.3", "0.0.1", "10.20.30"]
        invalid_versions = ["1.0", "v1.0.0", "1.0.0-beta", "1.0.0.0"]

        for version in valid_versions:
            doc = {"version": version, "title": "Test"}
            assert validate_docs_json(doc) is True

        for version in invalid_versions:
            doc = {"version": version, "title": "Test"}
            with pytest.raises(ValidationError):
                validate_docs_json(doc, strict=True)

    def test_nested_sections_validation(self, sample_docs_json):
        """Test validation of nested sections structure."""
        assert validate_docs_json(sample_docs_json) is True

        invalid_doc = sample_docs_json.copy()
        invalid_doc["sections"] = [{"invalid": "structure"}]
        with pytest.raises(ValidationError):
            validate_docs_json(invalid_doc, strict=True)

class TestDocsJsonParsing:
    """Test suite for JSON documentation parsing functionality."""

    def test_parse_valid_json_file(self, tmp_path, sample_docs_json):
        """Test parsing valid JSON documentation from file."""
        json_file = tmp_path / "docs.json"
        json_file.write_text(json.dumps(sample_docs_json, indent=2))

        result = parse_docs_json_file(str(json_file))
        assert result == sample_docs_json

    def test_parse_invalid_json_syntax(self, tmp_path, invalid_json_strings):
        """Test parsing files with invalid JSON syntax."""
        for i, invalid_json in enumerate(invalid_json_strings):
            json_file = tmp_path / f"invalid_{i}.json"
            json_file.write_text(invalid_json)
            with pytest.raises(json.JSONDecodeError):
                parse_docs_json_file(str(json_file))

    def test_parse_nonexistent_file(self):
        """Test parsing non-existent JSON file."""
        with pytest.raises(FileNotFoundError):
            parse_docs_json_file("/nonexistent/path/docs.json")

    def test_parse_empty_file(self, tmp_path):
        """Test parsing empty JSON file."""
        empty_file = tmp_path / "empty.json"
        empty_file.write_text("")
        with pytest.raises(json.JSONDecodeError):
            parse_docs_json_file(str(empty_file))

    def test_parse_large_json_file(self, tmp_path):
        """Test parsing large JSON documentation files."""
        large_doc = {
            "version": "1.0.0",
            "title": "Large Documentation",
            "sections": [
                {
                    "id": f"section_{i}",
                    "title": f"Section {i}",
                    "content": "Lorem ipsum " * 100,
                    "subsections": [
                        {
                            "id": f"subsection_{i}_{j}",
                            "title": f"Subsection {i}.{j}",
                            "content": "Content " * 50
                        }
                        for j in range(10)
                    ]
                }
                for i in range(100)
            ]
        }
        json_file = tmp_path / "large_docs.json"
        json_file.write_text(json.dumps(large_doc))
        result = parse_docs_json_file(str(json_file))
        assert len(result["sections"]) == 100
        assert all(len(sec["subsections"]) == 10 for sec in result["sections"])

class TestDocsJsonTransformation:
    """Test suite for JSON documentation transformation functionality."""

    def test_convert_to_markdown(self, sample_docs_json):
        """Test conversion of JSON documentation to Markdown format."""
        markdown_output = convert_docs_to_markdown(sample_docs_json)
        assert "# API Documentation" in markdown_output
        assert "## Introduction" in markdown_output
        assert "## Authentication" in markdown_output
        assert "### OAuth" in markdown_output

    def test_extract_metadata(self, sample_docs_json):
        """Test extraction of metadata from documentation JSON."""
        metadata = extract_docs_metadata(sample_docs_json)
        expected_metadata = {
            "version": "1.0.0",
            "title": "API Documentation",
            "created": "2024-01-01T00:00:00Z",
            "updated": "2024-06-01T00:00:00Z",
            "authors": ["John Doe", "Jane Smith"],
            "section_count": 2,
            "subsection_count": 1
        }
        assert metadata == expected_metadata

    def test_filter_sections_by_id(self, sample_docs_json):
        """Test filtering documentation sections by ID."""
        filtered = filter_docs_sections(sample_docs_json, ["intro"])
        assert len(filtered["sections"]) == 1
        assert filtered["sections"][0]["id"] == "intro"

    def test_merge_documentation_json(self, sample_docs_json):
        """Test merging multiple documentation JSON files."""
        doc2 = {
            "version": "1.0.0",
            "title": "Additional Documentation",
            "sections": [
                {
                    "id": "advanced",
                    "title": "Advanced Topics",
                    "content": "Advanced usage patterns",
                    "subsections": []
                }
            ]
        }
        merged = merge_docs_json([sample_docs_json, doc2])
        assert len(merged["sections"]) == 3
        ids = [sec["id"] for sec in merged["sections"]]
        assert set(ids) == {"intro", "auth", "advanced"}

    def test_generate_table_of_contents(self, sample_docs_json):
        """Test generating table of contents from documentation JSON."""
        toc = generate_docs_toc(sample_docs_json)
        expected_toc = [
            {"id": "intro", "title": "Introduction", "level": 1, "subsections": []},
            {
                "id": "auth",
                "title": "Authentication",
                "level": 1,
                "subsections": [
                    {"id": "oauth", "title": "OAuth", "level": 2, "subsections": []}
                ]
            }
        ]
        assert toc == expected_toc

class TestDocsJsonErrorHandling:
    """Test suite for error handling in JSON documentation processing."""

    def test_handle_corrupted_json_data(self, tmp_path):
        """Test handling of corrupted JSON data."""
        corrupted_data = b'\x00\x01\x02invalid json data\xff\xfe'
        corrupted_file = tmp_path / "corrupted.json"
        corrupted_file.write_bytes(corrupted_data)
        with pytest.raises((json.JSONDecodeError, UnicodeDecodeError)):
            parse_docs_json_file(str(corrupted_file))

    def test_handle_permission_denied(self, tmp_path):
        """Test handling of file permission errors."""
        json_file = tmp_path / "restricted.json"
        json_file.write_text('{"version": "1.0.0", "title": "Test"}')
        json_file.chmod(0o000)
        try:
            with pytest.raises(PermissionError):
                parse_docs_json_file(str(json_file))
        finally:
            json_file.chmod(0o644)

    def test_handle_circular_references(self):
        """Test handling of circular references in JSON data."""
        doc_with_refs = {"version": "1.0.0", "title": "Test Doc", "sections": []}
        section = {"id": "test", "title": "Test", "parent": doc_with_refs}
        doc_with_refs["sections"].append(section)
        result = process_docs_with_references(doc_with_refs)
        assert "sections" in result

    def test_handle_memory_limits(self):
        """Test handling of very large JSON documents."""
        deeply_nested = {"level": 0}
        current = deeply_nested
        for i in range(1000):
            current["nested"] = {"level": i + 1}
            current = current["nested"]
        with pytest.raises((RecursionError, MemoryError)):
            process_deeply_nested_docs(deeply_nested, max_depth=100)

    @patch('builtins.open', mock_open(read_data='{"invalid": json}'))
    def test_mock_file_operations(self):
        """Test file operations with mocked file system."""
        with pytest.raises(json.JSONDecodeError):
            parse_docs_json_file("mocked_file.json")

class TestDocsJsonPerformance:
    """Test suite for performance testing of JSON documentation processing."""

    def test_batch_processing_performance(self, tmp_path):
        """Test performance of batch processing multiple JSON files."""
        import time
        test_files = []
        for i in range(10):
            doc = {
                "version": "1.0.0",
                "title": f"Document {i}",
                "sections": [
                    {"id": f"section_{j}", "title": f"Section {j}", "content": "Content " * 100}
                    for j in range(50)
                ]
            }
            json_file = tmp_path / f"doc_{i}.json"
            json_file.write_text(json.dumps(doc))
            test_files.append(str(json_file))
        start = time.time()
        results = batch_process_docs_json(test_files)
        duration = time.time() - start
        assert len(results) == 10
        assert duration < 5.0

    def test_memory_usage_large_documents(self):
        """Test memory usage with large documentation files."""
        import sys
        large_sections = []
        for i in range(1000):
            large_sections.append({
                "id": f"section_{i}",
                "title": f"Section {i}",
                "content": "Lorem ipsum dolor sit amet " * 200,
                "subsections": [
                    {"id": f"sub_{i}_{j}", "title": f"Subsection {i}.{j}", "content": "Detailed content " * 100}
                    for j in range(5)
                ]
            })
        large_doc = {"version": "1.0.0", "title": "Large Document", "sections": large_sections}
        initial_mem = sys.getsizeof(large_doc)
        processed = process_large_docs_json(large_doc)
        final_mem = sys.getsizeof(processed)
        assert final_mem < initial_mem * 2

    @pytest.mark.parametrize("doc_size", [10, 100, 500, 1000])
    def test_scaling_performance(self, doc_size):
        """Test performance scaling with different document sizes."""
        import time
        doc = {
            "version": "1.0.0",
            "title": f"Document with {doc_size} sections",
            "sections": [{"id": f"section_{i}", "title": f"Section {i}", "content": f"Content for section {i}"} for i in range(doc_size)]
        }
        start = time.time()
        result = process_docs_json(doc)
        elapsed = time.time() - start
        assert elapsed < doc_size * 0.001
        assert len(result["sections"]) == doc_size

class TestDocsJsonParametrized:
    """Parametrized tests for comprehensive coverage."""

    @pytest.mark.parametrize("version,expected", [
        ("1.0.0", True), ("2.1.3", True), ("0.0.1", True),
        ("v1.0.0", False), ("1.0", False), ("1.0.0-beta", False),
        ("", False), (None, False)
    ])
    def test_version_validation_parametrized(self, version, expected):
        """Parametrized test for version validation."""
        doc = {"version": version, "title": "Test Document"}
        assert validate_docs_version(doc) is expected

    @pytest.mark.parametrize("file_extension", [".json", ".JSON", ".Json"])
    def test_file_extension_handling(self, tmp_path, sample_docs_json, file_extension):
        """Test handling of different file extensions."""
        json_file = tmp_path / f"docs{file_extension}"
        json_file.write_text(json.dumps(sample_docs_json))
        result = parse_docs_json_file(str(json_file))
        assert result == sample_docs_json

    @pytest.mark.parametrize("encoding", ["utf-8", "utf-16", "latin-1"])
    def test_file_encoding_support(self, tmp_path, encoding):
        """Test support for different file encodings."""
        doc = {"version": "1.0.0", "title": "Test Document", "content": "Hello 世界"}
        json_file = tmp_path / f"docs_{encoding}.json"
        with open(json_file, 'w', encoding=encoding) as f:
            json.dump(doc, f, ensure_ascii=False)
        result = parse_docs_json_file(str(json_file), encoding=encoding)
        assert result == doc

    @pytest.mark.parametrize("section_count", [0, 1, 10, 100])
    def test_variable_section_counts(self, section_count):
        """Test documents with varying numbers of sections."""
        doc = {
            "version": "1.0.0",
            "title": "Test Document",
            "sections": [{"id": f"section_{i}", "title": f"Section {i}", "content": f"Content {i}"} for i in range(section_count)]
        }
        assert validate_docs_json(doc) is True
        toc = generate_docs_toc(doc)
        assert len(toc) == section_count

class TestDocsJsonIntegration:
    """Integration tests for complete JSON documentation workflows."""

    @pytest.fixture(autouse=True)
    def setup_and_teardown(self, tmp_path):
        """Set up and tear down test environment."""
        self.test_dir = tmp_path / "docs_test"
        self.test_dir.mkdir()
        self.input_file = self.test_dir / "input.json"
        self.output_file = self.test_dir / "output.json"
        yield
        if self.input_file.exists():
            self.input_file.unlink()
        if self.output_file.exists():
            self.output_file.unlink()

    def test_complete_documentation_pipeline(self, sample_docs_json):
        """Test complete pipeline from JSON input to processed output."""
        self.input_file.write_text(json.dumps(sample_docs_json))
        parsed = parse_docs_json_file(str(self.input_file))
        validated = validate_and_process_docs(parsed)
        enhanced = enhance_docs_metadata(validated)
        with open(self.output_file, 'w') as f:
            json.dump(enhanced, f, indent=2)
        assert self.output_file.exists()
        final = json.loads(self.output_file.read_text())
        assert final["version"] == sample_docs_json["version"]
        assert final["title"] == sample_docs_json["title"]
        assert "enhanced_metadata" in final

    @patch('requests.get')
    def test_remote_json_fetching(self, mock_get, sample_docs_json):
        """Test fetching JSON documentation from remote sources."""
        mock_resp = Mock()
        mock_resp.json.return_value = sample_docs_json
        mock_resp.status_code = 200
        mock_get.return_value = mock_resp
        result = fetch_remote_docs_json("https://example.com/docs.json")
        assert result == sample_docs_json
        mock_get.assert_called_once_with("https://example.com/docs.json")

    def test_concurrent_processing(self, tmp_path):
        """Test concurrent processing of multiple JSON documents."""
        import concurrent.futures
        docs, files = [], []
        for i in range(5):
            doc = {"version": "1.0.0", "title": f"Document {i}", "sections": [{"id": f"s{j}", "title": f"Section {j}"} for j in range(10)]}
            docs.append(doc)
            path = tmp_path / f"doc_{i}.json"
            path.write_text(json.dumps(doc))
            files.append(str(path))
        results = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            futures = {executor.submit(parse_docs_json_file, f): f for f in files}
            for fut in concurrent.futures.as_completed(futures):
                results.append(fut.result())
        assert len(results) == 5
        assert all(isinstance(r, dict) for r in results)

    def test_error_recovery_and_logging(self, tmp_path, caplog):
        """Test error recovery and logging functionality."""
        import logging
        valid = tmp_path / "valid.json"
        invalid = tmp_path / "invalid.json"
        missing = tmp_path / "missing.json"
        valid.write_text('{"version": "1.0.0", "title": "Valid"}')
        invalid.write_text('{"invalid": json}')
        files = [str(valid), str(invalid), str(missing)]
        with caplog.at_level(logging.WARNING):
            results = batch_process_docs_with_recovery(files)
        assert len(results) == 1
        assert "invalid.json" in caplog.text
        assert "missing.json" in caplog.text

class DocsJsonTestUtils:
    """Utility functions for testing JSON documentation functionality."""

    @staticmethod
    def create_test_doc(title="Test Document", section_count=3, subsection_count=2):
        """Create a test documentation JSON structure."""
        return {
            "version": "1.0.0",
            "title": title,
            "description": f"Test documentation with {section_count} sections",
            "sections": [
                {
                    "id": f"section_{i}",
                    "title": f"Section {i}",
                    "content": f"Content for section {i}",
                    "subsections": [
                        {
                            "id": f"subsection_{i}_{j}",
                            "title": f"Subsection {i}.{j}",
                            "content": f"Content for subsection {i}.{j}"
                        }
                        for j in range(subsection_count)
                    ]
                }
                for i in range(section_count)
            ],
            "metadata": {
                "created": "2024-01-01T00:00:00Z",
                "updated": "2024-06-01T00:00:00Z",
                "authors": ["Test Author"]
            }
        }

    @staticmethod
    def assert_docs_structure_valid(doc):
        """Assert that a documentation structure is valid."""
        assert "version" in doc
        assert "title" in doc
        assert isinstance(doc.get("sections", []), list)
        for section in doc.get("sections", []):
            assert "id" in section
            assert "title" in section
            assert isinstance(section.get("subsections", []), list)

class TestDocsJsonWithUtils:
    """Tests using the utility functions for cleaner test code."""

    def test_create_and_validate_test_doc(self):
        """Test creation and validation of test documents."""
        doc = DocsJsonTestUtils.create_test_doc("My Test Doc", 5, 3)
        DocsJsonTestUtils.assert_docs_structure_valid(doc)
        assert doc["title"] == "My Test Doc"
        assert len(doc["sections"]) == 5
        assert all(len(sec["subsections"]) == 3 for sec in doc["sections"])

    def test_multiple_document_variations(self):
        """Test multiple variations of test documents."""
        variations = [(1, 0), (0, 0), (10, 5), (3, 1)]
        for sc, ssc in variations:
            doc = DocsJsonTestUtils.create_test_doc(f"Doc_{sc}_{ssc}", sc, ssc)
            DocsJsonTestUtils.assert_docs_structure_valid(doc)
            assert len(doc["sections"]) == sc

class TestDocsJsonComprehensive:
    """Comprehensive test suite covering all aspects of JSON documentation processing."""

    def test_end_to_end_documentation_workflow(self, tmp_path):
        """Complete end-to-end test of documentation processing workflow."""
        original_doc = DocsJsonTestUtils.create_test_doc("Complete Test", 10, 5)
        input_file = tmp_path / "comprehensive_test.json"
        input_file.write_text(json.dumps(original_doc, indent=2))

        parsed = parse_docs_json_file(str(input_file))
        validated = validate_docs_json(parsed, strict=True)
        metadata = extract_docs_metadata(parsed)
        toc = generate_docs_toc(parsed)
        markdown = convert_docs_to_markdown(parsed)

        assert validated is True
        assert metadata["section_count"] == 10
        assert len(toc) == 10
        assert "# Complete Test" in markdown
        assert "## Section 0" in markdown
        assert "### Subsection 0.0" in markdown

        output_file = tmp_path / "processed_output.json"
        with open(output_file, 'w') as f:
            json.dump(parsed, f, indent=2)

        reloaded = parse_docs_json_file(str(output_file))
        assert reloaded == original_doc

        print(f"✅ Comprehensive test completed successfully")
        print(f"   - Processed {len(original_doc['sections'])} sections")
        print(f"   - Generated {len(toc)} TOC entries")
        print(f"   - Created {len(markdown.split('\\n'))} lines of Markdown")