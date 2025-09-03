import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { craftCategories, serviceCategories } from '@/config/categories';

interface CategoryFilterProps {
  /** Callback function when a category and optionally a subcategory is selected */
  onSelect: (category: string, subCategory?: string) => void;
  /** Initially selected category ID */
  defaultCategory?: string;
  /** Initially selected subcategory ID */
  defaultSubCategory?: string;
}

export default function CategoryFilter({
  onSelect,
  defaultCategory,
  defaultSubCategory
}: CategoryFilterProps) {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(defaultCategory);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | undefined>(defaultSubCategory);

  // Combine all categories
  const categories = [...serviceCategories, ...craftCategories];

  // Find the current category object
  const currentCategory = categories.find(cat => cat.id === selectedCategory);

  // Handler for selecting a category and subcategory
  const handleSelection = (categoryId: string, subCategoryId?: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubCategory(subCategoryId);
    onSelect(categoryId, subCategoryId);
  };

  // Reset subcategory when category changes
  useEffect(() => {
    if (!currentCategory?.subCategories?.find(sub => sub.id === selectedSubCategory)) {
      setSelectedSubCategory(undefined);
    }
  }, [selectedCategory, currentCategory, selectedSubCategory]);

  const getSelectedLabel = () => {
    const category = categories.find(cat => cat.id === selectedCategory);
    const subCategory = category?.subCategories?.find(sub => sub.id === selectedSubCategory);
    return {
      categoryName: category?.name || '',
      subCategoryName: subCategory?.name || ''
    };
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span>
            {selectedCategory ? getSelectedLabel().categoryName : "Select category..."}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Search categories..." />
          <CommandList>
            <CommandEmpty>No categories found.</CommandEmpty>
            {categories.map((category) => (
              <CommandGroup key={category.id} heading={category.name}>
                {category.subCategories?.map((subCategory) => {
                  const isSelected = 
                    selectedCategory === category.id && 
                    selectedSubCategory === subCategory.id;
                  
                  return (
                    <CommandItem
                      key={`${category.id}-${subCategory.id}`}
                      onSelect={() => {
                        handleSelection(category.id, subCategory.id);
                        setOpen(false);
                      }}
                      className="flex items-center justify-between"
                    >
                      <span>{subCategory.name}</span>
                      {isSelected && <Check className="h-4 w-4" />}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
          <CommandSeparator />
        </Command>
      </PopoverContent>
      {selectedCategory && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedSubCategory && (
            <Badge
              variant="secondary"
              className="text-sm"
            >
              {getSelectedLabel().subCategoryName}
            </Badge>
          )}
        </div>
      )}
    </Popover>
  );
}
