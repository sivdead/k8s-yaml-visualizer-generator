
import yaml from 'js-yaml';

export const parseYaml = (content: string): any => {
  try {
    return yaml.load(content);
  } catch (e) {
    console.error("Failed to parse YAML", e);
    throw e;
  }
};

// Helper: Custom serialization wrapper to handle special logic (like Secret encoding)
export const toYaml = (data: any, indentLevel = 0): string => {
  // Clone data to avoid mutating state
  let dataToProcess = null;
  try {
    dataToProcess = JSON.parse(JSON.stringify(data));
  } catch (e) {
    dataToProcess = data;
  }

  // Extract and remove _comment before processing
  let commentLines = '';
  if (dataToProcess && dataToProcess._comment) {
    const comment = dataToProcess._comment;
    // Split by newlines and prepend # to each line
    commentLines = comment
      .split('\n')
      .map((line: string) => `# ${line}`)
      .join('\n') + '\n';
    delete dataToProcess._comment;
  }

  // Special handling for Secret: Base64 encode values in 'data'
  if (dataToProcess && dataToProcess.kind === 'Secret' && dataToProcess.data) {
    const keys = Object.keys(dataToProcess.data);
    keys.forEach(k => {
      // Check if already looks like base64? No, assume state is PLAIN TEXT per plan.
      // Is it simple string?
      if (typeof dataToProcess.data[k] === 'string') {
        try {
          // btoa needs binary string
          dataToProcess.data[k] = btoa(dataToProcess.data[k]);
        } catch (e) {
          // ignore if fails
        }
      }
    });
  }

  return commentLines + recursiveToYaml(dataToProcess, indentLevel);
}

const recursiveToYaml = (data: any, indentLevel = 0): string => {
  const indent = '  '.repeat(indentLevel);

  if (data === null) return 'null';
  if (data === undefined) return '';

  if (typeof data !== 'object') {
    return String(data);
  }

  if (Array.isArray(data)) {
    if (data.length === 0) return '[]';
    return data.map(item => {
      const itemYaml = recursiveToYaml(item, indentLevel + 1).trimStart();
      return `${indent}- ${itemYaml}`;
    }).join('\n');
  }

  // Object
  const keys = Object.keys(data);
  if (keys.length === 0) return '{}';

  return keys.map(key => {
    const value = data[key];

    if (value === undefined) return '';

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return `${indent}${key}: []`;
      }
      return `${indent}${key}:\n${recursiveToYaml(value, indentLevel)}`;
    }

    if (typeof value === 'object' && value !== null) {
      if (Object.keys(value).length === 0) return `${indent}${key}: {}`;
      return `${indent}${key}:\n${recursiveToYaml(value, indentLevel + 1)}`;
    }

    // Support for literal block scalars (|) if the string has newlines
    if (typeof value === 'string' && value.includes('\n')) {
      const indentedLines = value.split('\n').map(line => `${indent}  ${line}`).join('\n');
      return `${indent}${key}: |\n${indentedLines}`;
    }

    // Basic value handling
    return `${indent}${key}: ${value}`;
  }).filter(line => line.trim() !== '').join('\n');
};

export const downloadYaml = (filename: string, content: string) => {
  const element = document.createElement('a');
  const file = new Blob([content], { type: 'text/yaml' });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};
