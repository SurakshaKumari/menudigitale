import React, { useState, useEffect } from 'react';

const languages = [
  { code: 'it', name: 'Italiano', flag: '🇮🇹', native: 'Italiano' },
  { code: 'en', name: 'English', flag: '🇺🇸', native: 'English' },
  { code: 'fr', name: 'French', flag: '🇫🇷', native: 'Français' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', native: 'Español' },
  { code: 'de', name: 'German', flag: '🇩🇪', native: 'Deutsch' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹', native: 'Português' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺', native: 'Русский' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳', native: '中文' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', native: 'العربية' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', native: '日本語' }
];

const LanguageSelector = ({ currentLanguage, onLanguageChange, translations = [] }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Get languages that have translations
  const translatedLanguages = translations.map(t => t.language);

  const handleLanguageSelect = (languageCode) => {
    onLanguageChange(languageCode);
    setIsOpen(false);
  };

  const currentLang = languages.find(l => l.code === currentLanguage) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg border transition-colors"
      >
        <span className="text-xl">{currentLang.flag}</span>
        <span className="font-medium text-sm">{currentLang.code.toUpperCase()}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-20 border">
            <div className="p-3 border-b">
              <h3 className="text-sm font-semibold text-gray-700">Select Language</h3>
              <p className="text-xs text-gray-500">AI-powered translation</p>
            </div>
            
            <div className="max-h-80 overflow-y-auto py-1">
              {languages.map((language) => {
                const hasTranslation = translatedLanguages.includes(language.code);
                const isCurrent = currentLanguage === language.code;
                
                return (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageSelect(language.code)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 ${
                      isCurrent ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{language.flag}</span>
                      <div>
                        <span className="font-medium text-sm">{language.name}</span>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">{language.native}</span>
                          {hasTranslation && !isCurrent && (
                            <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                              ✓
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {isCurrent && (
                      <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="p-3 border-t bg-gray-50">
              <p className="text-xs text-gray-600">
                Languages with ✓ are already translated. First-time translation may take a moment.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;