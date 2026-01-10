'use client';

import { BgColorsOutlined } from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import { Button, Select, Space, Tooltip } from 'antd';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

interface Language {
  value: string;
  label: string;
  monacoLanguage: string;
}

const PROGRAMMING_LANGUAGES: Language[] = [
  { value: 'javascript', label: 'JavaScript', monacoLanguage: 'javascript' },
  { value: 'typescript', label: 'TypeScript', monacoLanguage: 'typescript' },
  { value: 'python', label: 'Python', monacoLanguage: 'python' },
  { value: 'java', label: 'Java', monacoLanguage: 'java' },
  { value: 'cpp', label: 'C++', monacoLanguage: 'cpp' },
  { value: 'csharp', label: 'C#', monacoLanguage: 'csharp' },
  { value: 'php', label: 'PHP', monacoLanguage: 'php' },
  { value: 'go', label: 'Go', monacoLanguage: 'go' },
  { value: 'rust', label: 'Rust', monacoLanguage: 'rust' },
  { value: 'kotlin', label: 'Kotlin', monacoLanguage: 'kotlin' },
  { value: 'swift', label: 'Swift', monacoLanguage: 'swift' },
  { value: 'ruby', label: 'Ruby', monacoLanguage: 'ruby' },
  { value: 'html', label: 'HTML', monacoLanguage: 'html' },
  { value: 'css', label: 'CSS', monacoLanguage: 'css' },
  { value: 'sql', label: 'SQL', monacoLanguage: 'sql' },
  { value: 'json', label: 'JSON', monacoLanguage: 'json' },
  { value: 'xml', label: 'XML', monacoLanguage: 'xml' },
  { value: 'markdown', label: 'Markdown', monacoLanguage: 'markdown' },
  { value: 'bash', label: 'Bash', monacoLanguage: 'shell' },
];

const EDITOR_THEMES = [
  { value: 'vs-light', label: 'Light' },
  { value: 'vs-dark', label: 'Dark' },
  { value: 'hc-black', label: 'High Contrast' },
];

export const CodeBeautifier: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('javascript');
  const [editorTheme, setEditorTheme] = useState<string>('vs-dark');
  const [filename, setFilename] = useState<string>('index.js');
  const [code, setCode] = useState<string>('// Write your code here\n');
  const [isFilenameEditing, setIsFilenameEditing] = useState<boolean>(false);
  const filenameRef = useRef<HTMLDivElement>(null);

  const currentLanguage = PROGRAMMING_LANGUAGES.find((lang) => lang.value === selectedLanguage);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  };

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
  };

  const handleThemeChange = (value: string) => {
    setEditorTheme(value);
  };

  const handleFilenameClick = () => {
    setIsFilenameEditing(true);
  };

  const handleFilenameBlur = () => {
    setIsFilenameEditing(false);
  };

  const handleFilenameChange = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.textContent || '';
    setFilename(text || 'index.js');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
  };

  const handleResetCode = () => {
    setCode('// Write your code here\n');
  };

  useEffect(() => {
    if (isFilenameEditing && filenameRef.current) {
      filenameRef.current.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(filenameRef.current);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isFilenameEditing]);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-border p-4 bg-card">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Language:</label>
          <Select value={selectedLanguage} onChange={handleLanguageChange} style={{ width: 200 }} options={PROGRAMMING_LANGUAGES} className="antd-select-override" />
        </div>

        {/* Filename Editor - Middle */}
        <div className="flex-1 flex justify-center">
          <div
            ref={filenameRef}
            contentEditable={isFilenameEditing}
            onBlur={handleFilenameBlur}
            onClick={handleFilenameClick}
            onInput={handleFilenameChange}
            className={`outline-none px-3 py-2 rounded-md transition-all cursor-text ${
              isFilenameEditing ? 'bg-input border-2 border-primary text-primary' : 'bg-muted text-muted-foreground hover:bg-secondary'
            }`}
            suppressContentEditableWarning
          >
            {filename}
          </div>
        </div>

        {/* Theme Selector - Right Side */}
        <div className="flex items-center gap-3">
          <Tooltip title="Change Editor Theme">
            <div className="flex items-center gap-2">
              <BgColorsOutlined className="text-lg" />
              <Select value={editorTheme} onChange={handleThemeChange} style={{ width: 140 }} options={EDITOR_THEMES} className="antd-select-override" />
            </div>
          </Tooltip>
        </div>
      </div>

      {/* Editor Container */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={currentLanguage?.monacoLanguage || 'javascript'}
          value={code}
          onChange={handleEditorChange}
          theme={editorTheme === 'vs-light' ? 'vs' : editorTheme}
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-border p-4 bg-card">
        <Space>
          <Button onClick={handleResetCode}>Reset</Button>
          <Button onClick={handleCopyCode} type="primary">
            Copy Code
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default CodeBeautifier;
