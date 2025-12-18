import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, FileText, Image as ImageIcon } from "lucide-react";

export default function UploadZone({ onFileSelect, disabled }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type === "application/pdf" || file.type.startsWith("image/")) {
        onFileSelect(file);
      }
    }
  };

  const handleFileInput = (e) => {
    if (disabled) return;

    const files = e.target.files;
    if (files && files[0]) {
      onFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-xl p-12 transition-all duration-200 ${
        dragActive 
          ? "border-blue-400 bg-blue-50" 
          : "border-slate-200 hover:border-slate-300 bg-white"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
      />

      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
          <Upload className="w-8 h-8 text-blue-600" />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Arraste e solte seu arquivo aqui
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            ou clique para selecionar um arquivo
          </p>
        </div>

        <div className="flex justify-center gap-8 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-500" />
            <span>PDF</span>
          </div>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-500" />
            <span>Imagens</span>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Tamanho máximo: 10MB
        </p>
      </div>
    </div>
  );
}