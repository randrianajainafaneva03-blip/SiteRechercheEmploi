import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, X, Star, Hash } from 'lucide-react';

const SkillsAutocomplete = ({ selectedSkills = [], onSkillsChange, placeholder = "Ajouter une compétence..." }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Compétences populaires pré-définies (pas de base de données pour plus de rapidité)
  const POPULAR_SKILLS = [
    // Développement Web
    { name: 'React', category: 'Développement Web' },
    { name: 'Vue.js', category: 'Développement Web' },
    { name: 'Angular', category: 'Développement Web' },
    { name: 'JavaScript', category: 'Développement Web' },
    { name: 'TypeScript', category: 'Développement Web' },
    { name: 'Node.js', category: 'Développement Web' },
    { name: 'PHP', category: 'Développement Web' },
    { name: 'Laravel', category: 'Développement Web' },
    { name: 'Django', category: 'Développement Web' },
    { name: 'HTML/CSS', category: 'Développement Web' },
    { name: 'WordPress', category: 'Développement Web' },
    { name: 'Shopify', category: 'Développement Web' },
    
    // Design
    { name: 'Photoshop', category: 'Design Graphique' },
    { name: 'Illustrator', category: 'Design Graphique' },
    { name: 'Figma', category: 'Design Graphique' },
    { name: 'Sketch', category: 'Design Graphique' },
    { name: 'InDesign', category: 'Design Graphique' },
    { name: 'After Effects', category: 'Design Graphique' },
    { name: 'Canva', category: 'Design Graphique' },
    { name: 'UI/UX Design', category: 'Design Graphique' },
    
    // Marketing
    { name: 'SEO', category: 'Marketing Digital' },
    { name: 'Google Ads', category: 'Marketing Digital' },
    { name: 'Facebook Ads', category: 'Marketing Digital' },
    { name: 'Content Marketing', category: 'Marketing Digital' },
    { name: 'Email Marketing', category: 'Marketing Digital' },
    { name: 'Social Media', category: 'Marketing Digital' },
    { name: 'Analytics', category: 'Marketing Digital' },
    
    // Comptabilité
    { name: 'Microsoft Excel', category: 'Comptabilité' },
    { name: 'QuickBooks', category: 'Comptabilité' },
    { name: 'Sage', category: 'Comptabilité' },
    { name: 'Comptabilité générale', category: 'Comptabilité' },
    
    // Langues
    { name: 'Français', category: 'Traduction' },
    { name: 'Anglais', category: 'Traduction' },
    { name: 'Malagasy', category: 'Traduction' },
    { name: 'Allemand', category: 'Traduction' },
    { name: 'Espagnol', category: 'Traduction' },
    
    // Autres
    { name: 'Microsoft Office', category: 'Autres' },
    { name: 'Gestion de projet', category: 'Autres' },
    { name: 'Communication', category: 'Autres' },
    { name: 'Formation', category: 'Autres' }
  ];

  // Rechercher des suggestions avec debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (inputValue.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        searchSkills(inputValue.trim());
      }, 300); // Debounce de 300ms
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [inputValue]);

  const searchSkills = async (query) => {
    setLoading(true);
    
    try {
      // Recherche locale d'abord dans les compétences populaires
      const localMatches = POPULAR_SKILLS.filter(skill =>
        skill.name.toLowerCase().includes(query.toLowerCase()) &&
        !selectedSkills.some(selected => 
          selected.toLowerCase() === skill.name.toLowerCase()
        )
      ).slice(0, 5);

      // Recherche dans la base de données seulement si la table existe
      let dbMatches = [];
      try {
        const { data, error } = await supabase
          .from('skills')
          .select('name, category')
          .textSearch('name', query)
          .limit(5);

        if (!error && data) {
          dbMatches = data
            .filter(skill => !selectedSkills.some(selected => 
              selected.toLowerCase() === skill.name.toLowerCase()
            ))
            .filter(skill => !localMatches.some(local => 
              local.name.toLowerCase() === skill.name.toLowerCase()
            ));
        }
      } catch (dbError) {
        console.log('Base de données skills non disponible, utilisation des compétences locales uniquement');
      }

      // Combiner les résultats
      const allSuggestions = [...localMatches, ...dbMatches].slice(0, 8);
      
      setSuggestions(allSuggestions);
      setShowSuggestions(allSuggestions.length > 0);
      setHighlightedIndex(-1);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      // En cas d'erreur, utiliser seulement les compétences locales
      const localMatches = POPULAR_SKILLS.filter(skill =>
        skill.name.toLowerCase().includes(query.toLowerCase()) &&
        !selectedSkills.some(selected => 
          selected.toLowerCase() === skill.name.toLowerCase()
        )
      ).slice(0, 8);
      
      setSuggestions(localMatches);
      setShowSuggestions(localMatches.length > 0);
    } finally {
      setLoading(false);
    }
  };

  const addSkillToDatabase = async (skillName, category = null) => {
    try {
      // Essayer d'ajouter à la base de données seulement si elle existe
      const { data: existingSkill } = await supabase
        .from('skills')
        .select('id, usage_count')
        .eq('name', skillName)
        .maybeSingle();

      if (existingSkill) {
        // Incrémenter le compteur
        await supabase
          .from('skills')
          .update({ usage_count: (existingSkill.usage_count || 0) + 1 })
          .eq('id', existingSkill.id);
      } else {
        // Créer nouvelle compétence
        await supabase
          .from('skills')
          .insert({
            name: skillName,
            category: category || 'Autres',
            usage_count: 1
          });
      }
    } catch (error) {
      // Si la table n'existe pas ou erreur, continuer quand même
      console.log('Ajout à la base de données non disponible:', error.message);
    }
  };

  const handleAddSkill = async (skillName, category = null) => {
    if (!skillName || !skillName.trim()) return;

    const trimmedSkill = skillName.trim();
    
    // Vérifier si la compétence n'est pas déjà sélectionnée
    if (selectedSkills.some(skill => skill.toLowerCase() === trimmedSkill.toLowerCase())) {
      return;
    }

    // Ajouter à la liste immédiatement (pas d'attente de la DB)
    const newSkills = [...selectedSkills, trimmedSkill];
    onSkillsChange(newSkills);

    // Ajouter à la base de données en arrière-plan
    addSkillToDatabase(trimmedSkill, category);

    // Réinitialiser l'input
    setInputValue('');
    setSuggestions([]);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };

  const handleRemoveSkill = (skillToRemove) => {
    const newSkills = selectedSkills.filter(skill => skill !== skillToRemove);
    onSkillsChange(newSkills);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showSuggestions && highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        handleAddSkill(suggestions[highlightedIndex].name, suggestions[highlightedIndex].category);
      } else if (inputValue.trim()) {
        // Permettre l'ajout libre de compétences
        handleAddSkill(inputValue.trim());
      }
      return;
    }

    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleAddSkill(suggestion.name, suggestion.category);
  };

  const handlePopularSkillClick = (skill) => {
    handleAddSkill(skill.name, skill.category);
  };

  // Fermer les suggestions quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrer les compétences populaires non sélectionnées
  const availablePopularSkills = POPULAR_SKILLS.filter(skill =>
    !selectedSkills.some(selected => 
      selected.toLowerCase() === skill.name.toLowerCase()
    )
  ).slice(0, 12);

  return (
    <div className="space-y-4">
      {/* Input d'autocomplétion */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={() => {
              if (inputValue.trim()) {
                handleAddSkill(inputValue.trim());
              }
            }}
            disabled={!inputValue.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-gradient-to-br from-job-purple to-job-pink text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div 
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto"
          >
            {loading && (
              <div className="p-3 text-center text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mx-auto"></div>
              </div>
            )}
            
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.name}-${index}`}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full p-3 text-left hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                  index === highlightedIndex ? 'bg-purple-50 border-purple-200' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{suggestion.name}</div>
                    {suggestion.category && (
                      <div className="text-xs text-gray-500 flex items-center mt-1">
                        <Hash className="h-3 w-3 mr-1" />
                        {suggestion.category}
                      </div>
                    )}
                  </div>
                  {POPULAR_SKILLS.some(p => p.name === suggestion.name) && (
                    <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Compétences populaires */}
      {availablePopularSkills.length > 0 && selectedSkills.length < 5 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Star className="h-4 w-4 mr-2 text-yellow-500" />
            Compétences populaires
          </h4>
          <div className="flex flex-wrap gap-2">
            {availablePopularSkills.slice(0, 8).map((skill, index) => (
              <button
                key={`popular-${skill.name}-${index}`}
                type="button"
                onClick={() => handlePopularSkillClick(skill)}
                className="px-3 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium hover:from-purple-200 hover:to-pink-200 transition-all duration-200 border border-purple-200 hover:border-purple-300"
              >
                {skill.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Compétences sélectionnées */}
      {selectedSkills.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Compétences sélectionnées ({selectedSkills.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedSkills.map((skill, index) => (
              <span
                key={`selected-${skill}-${index}`}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-black rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-2 text-gradient-to-br from-job-purple to-job-pink hover:text-red-200 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Message d'aide */}
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
        💡 <strong>Astuce :</strong> Tapez n'importe quelle compétence et appuyez sur Entrée pour l'ajouter. Les suggestions apparaissent automatiquement.
      </div>
    </div>
  );
};

export default SkillsAutocomplete;