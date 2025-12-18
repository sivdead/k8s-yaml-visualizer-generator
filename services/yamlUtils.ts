
// A lightweight custom JSON to YAML serializer to avoid heavy external dependencies for this demo.
export const toYaml = (data: any, indentLevel = 0): string => {
  const indent = '  '.repeat(indentLevel);
  
  if (data === null) return 'null';
  if (data === undefined) return '';
  
  if (typeof data !== 'object') {
    return String(data);
  }

  if (Array.isArray(data)) {
    if (data.length === 0) return '[]';
    return data.map(item => {
      const itemYaml = toYaml(item, indentLevel + 1).trimStart();
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
       return `${indent}${key}:\n${toYaml(value, indentLevel)}`;
    }

    if (typeof value === 'object' && value !== null) {
      if (Object.keys(value).length === 0) return `${indent}${key}: {}`;
      return `${indent}${key}:\n${toYaml(value, indentLevel + 1)}`;
    }

    // specific handling for multi-line strings could go here
    return `${indent}${key}: ${value}`;
  }).filter(line => line.trim() !== '').join('\n');
};

export const downloadYaml = (filename: string, content: string) => {
  const element = document.createElement('a');
  const file = new Blob([content], {type: 'text/yaml'});
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};
