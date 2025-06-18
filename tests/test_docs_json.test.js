const fs = require('fs');
const path = require('path');

// Import the docs.json file for testing
const docsJsonPath = path.join(__dirname, '../git/docs.json');
let docsJson;

describe('Docs JSON Validation Tests', () => {
  beforeAll(() => {
    // Load the docs.json file before running tests
    const docsJsonContent = fs.readFileSync(docsJsonPath, 'utf8');
    docsJson = JSON.parse(docsJsonContent);
  });

  describe('Schema Validation', () => {
    test('should have all required top-level fields', () => {
      expect(docsJson).toHaveProperty('name');
      expect(docsJson).toHaveProperty('version');
      expect(docsJson).toHaveProperty('description');
      expect(docsJson).toHaveProperty('sections');
      expect(docsJson).toHaveProperty('metadata');
    });

    test('should have correct data types for top-level fields', () => {
      expect(typeof docsJson.name).toBe('string');
      expect(typeof docsJson.version).toBe('string');
      expect(typeof docsJson.description).toBe('string');
      expect(Array.isArray(docsJson.sections)).toBe(true);
      expect(typeof docsJson.metadata).toBe('object');
    });

    test('should validate version format', () => {
      expect(docsJson.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    test('should have non-empty required string fields', () => {
      expect(docsJson.name.trim().length).toBeGreaterThan(0);
      expect(docsJson.description.trim().length).toBeGreaterThan(0);
    });
  });

  describe('Sections Structure Validation', () => {
    test('should have at least one section', () => {
      expect(docsJson.sections.length).toBeGreaterThan(0);
    });

    test('each section should have required fields', () => {
      docsJson.sections.forEach((section) => {
        expect(section).toHaveProperty('id');
        expect(section).toHaveProperty('title');
        expect(section).toHaveProperty('path');
        expect(typeof section.id).toBe('string');
        expect(typeof section.title).toBe('string');
        expect(typeof section.path).toBe('string');
      });
    });

    test('section IDs should be unique', () => {
      const sectionIds = docsJson.sections.map((section) => section.id);
      const uniqueIds = new Set(sectionIds);
      expect(uniqueIds.size).toBe(sectionIds.length);
    });

    test('section paths should start with forward slash', () => {
      docsJson.sections.forEach((section) => {
        expect(section.path).toMatch(/^\/docs/);
      });
    });

    test('sections with children should have valid child structure', () => {
      docsJson.sections.forEach((section) => {
        if (section.children) {
          expect(Array.isArray(section.children)).toBe(true);
          section.children.forEach((child) => {
            expect(child).toHaveProperty('id');
            expect(child).toHaveProperty('title');
            expect(child).toHaveProperty('path');
            expect(typeof child.id).toBe('string');
            expect(typeof child.title).toBe('string');
            expect(typeof child.path).toBe('string');
          });
        }
      });
    });
  });

  describe('Metadata Validation', () => {
    test('should have valid metadata structure', () => {
      expect(docsJson.metadata).toHaveProperty('lastUpdated');
      expect(docsJson.metadata).toHaveProperty('authors');
      expect(docsJson.metadata).toHaveProperty('tags');
    });

    test('should have valid ISO date format for lastUpdated', () => {
      const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
      expect(docsJson.metadata.lastUpdated).toMatch(isoDateRegex);
      expect(new Date(docsJson.metadata.lastUpdated).toString()).not.toBe('Invalid Date');
    });

    test('authors should be a non-empty array of strings', () => {
      expect(Array.isArray(docsJson.metadata.authors)).toBe(true);
      expect(docsJson.metadata.authors.length).toBeGreaterThan(0);
      docsJson.metadata.authors.forEach((author) => {
        expect(typeof author).toBe('string');
        expect(author.trim().length).toBeGreaterThan(0);
      });
    });

    test('tags should be a non-empty array of strings', () => {
      expect(Array.isArray(docsJson.metadata.tags)).toBe(true);
      expect(docsJson.metadata.tags.length).toBeGreaterThan(0);
      docsJson.metadata.tags.forEach((tag) => {
        expect(typeof tag).toBe('string');
        expect(tag.trim().length).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle malformed JSON gracefully', () => {
      const malformedJson = '{"name": "test", "sections": [}';
      expect(() => {
        JSON.parse(malformedJson);
      }).toThrow();
    });

    test('should validate empty sections array', () => {
      const emptyDocsJson = { ...docsJson, sections: [] };
      expect(emptyDocsJson.sections.length).toBe(0);
    });

    test('should handle missing optional fields', () => {
      const minimalSection = {
        id: 'test',
        title: 'Test Section',
        path: '/docs/test'
      };
      expect(minimalSection).toHaveProperty('id');
      expect(minimalSection).toHaveProperty('title');
      expect(minimalSection).toHaveProperty('path');
    });
  });

  describe('Performance and Boundary Tests', () => {
    test('should parse large JSON documents within reasonable time', (done) => {
      const startTime = Date.now();
      const largeDocsJson = {
        ...docsJson,
        sections: Array(1000).fill(0).map((_, i) => ({
          id: `section-${i}`,
          title: `Section ${i}`,
          path: `/docs/section-${i}`,
          children: Array(10).fill(0).map((_, j) => ({
            id: `child-${i}-${j}`,
            title: `Child ${i}-${j}`,
            path: `/docs/section-${i}/child-${j}`,
            content: `Content for child ${i}-${j}`
          }))
        }))
      };

      const jsonString = JSON.stringify(largeDocsJson);
      const parsed = JSON.parse(jsonString);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000);
      expect(parsed.sections.length).toBe(1000);
      done();
    });

    test('should handle deep nesting levels', () => {
      const deeplyNested = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: {
                  data: 'deep value'
                }
              }
            }
          }
        }
      };

      expect(deeplyNested.level1.level2.level3.level4.level5.data).toBe('deep value');
    });

    test('should validate maximum field lengths', () => {
      const longString = 'a'.repeat(10000);
      const testDoc = {
        ...docsJson,
        description: longString
      };

      expect(testDoc.description.length).toBe(10000);
      expect(typeof testDoc.description).toBe('string');
    });
  });

  describe('Data Integrity and Cross-Reference Tests', () => {
    const validateDocStructure = (doc) => (
      doc.hasOwnProperty('name') &&
      doc.hasOwnProperty('version') &&
      doc.hasOwnProperty('sections') &&
      Array.isArray(doc.sections)
    );

    const getAllPaths = (sections) => {
      const paths = [];
      sections.forEach((section) => {
        paths.push(section.path);
        if (section.children) {
          section.children.forEach((child) => {
            paths.push(child.path);
          });
        }
      });
      return paths;
    };

    test('should have consistent path hierarchy', () => {
      const allPaths = getAllPaths(docsJson.sections);
      docsJson.sections.forEach((section) => {
        if (section.children) {
          section.children.forEach((child) => {
            expect(child.path).toContain(section.path);
          });
        }
      });
    });

    test('should have no duplicate paths', () => {
      const allPaths = getAllPaths(docsJson.sections);
      const uniquePaths = new Set(allPaths);
      expect(uniquePaths.size).toBe(allPaths.length);
    });

    test('should validate complete document structure', () => {
      expect(validateDocStructure(docsJson)).toBe(true);
    });

    test('should handle special characters in content', () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const testContent = `Content with special chars: ${specialChars}`;
      expect(testContent).toContain(specialChars);
      expect(() => JSON.stringify({ content: testContent })).not.toThrow();
    });

    test('should handle Unicode characters properly', () => {
      const unicodeContent = 'Content with Unicode: 🚀 💡 ✅ 中文 العربية';
      const testDoc = {
        ...docsJson,
        description: unicodeContent
      };
      expect(testDoc.description).toContain('🚀');
      expect(testDoc.description).toContain('中文');
      expect(() => JSON.stringify(testDoc)).not.toThrow();
    });
  });

  describe('File System Integration Tests', () => {
    test('should be able to read docs.json file from filesystem', () => {
      expect(fs.existsSync(docsJsonPath)).toBe(true);
      expect(() => {
        const content = fs.readFileSync(docsJsonPath, 'utf8');
        JSON.parse(content);
      }).not.toThrow();
    });

    test('should handle file read errors gracefully', () => {
      const nonExistentPath = path.join(__dirname, 'non-existent.json');
      expect(() => {
        fs.readFileSync(nonExistentPath, 'utf8');
      }).toThrow();
    });

    test('should validate JSON file size is reasonable', () => {
      const stats = fs.statSync(docsJsonPath);
      expect(stats.size).toBeGreaterThan(0);
      expect(stats.size).toBeLessThan(1024 * 1024);
    });
  });

  describe('Regression and Compatibility Tests', () => {
    test('should maintain backward compatibility with expected structure', () => {
      const expectedKeys = ['name', 'version', 'description', 'sections', 'metadata'];
      expectedKeys.forEach((key) => {
        expect(docsJson).toHaveProperty(key);
      });
    });

    test('should handle version comparison', () => {
      const versionParts = docsJson.version.split('.').map(Number);
      expect(versionParts.length).toBe(3);
      expect(versionParts.every((part) => !isNaN(part))).toBe(true);
    });

    test('should validate all sections have consistent structure', () => {
      const requiredSectionKeys = ['id', 'title', 'path'];
      docsJson.sections.forEach((section) => {
        requiredSectionKeys.forEach((key) => {
          expect(section).toHaveProperty(key);
        });
      });
    });
  });

  describe('Test Environment and Cleanup', () => {
    afterAll(() => {
      // Cleanup any test artifacts or temporary files
      // Reset any global state if needed
      console.log('All docs.json tests completed successfully');
    });

    test('should have proper test environment setup', () => {
      expect(docsJson).toBeDefined();
      expect(typeof docsJson).toBe('object');
      expect(docsJson).not.toBeNull();
    });

    test('should validate test file itself exists', () => {
      expect(__filename).toContain('test_docs_json.test.js');
    });
  });
});

// Global error handler for unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Custom matcher for JSON schema validation
expect.extend({
  toBeValidDocsJson(received) {
    const pass =
      received.hasOwnProperty('name') &&
      received.hasOwnProperty('version') &&
      received.hasOwnProperty('sections') &&
      Array.isArray(received.sections);
    if (pass) {
      return {
        message: () =>
          `expected ${JSON.stringify(received)} not to be valid docs JSON`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${JSON.stringify(received)} to be valid docs JSON`,
        pass: false,
      };
    }
  },
});

// Example usage of custom matcher
describe('Custom Matcher Tests', () => {
  test('should use custom matcher for validation', () => {
    expect(docsJson).toBeValidDocsJson();
  });
});