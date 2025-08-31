import { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
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
import { craftCategories, serviceCategories, type Category } from '@/config/categories';

interface CategoryFilterProps {
  type?: 'service' | 'craft' | 'both';
  onSelectionChange: (categories: { categoryId: string; subCategoryId: string }[]) => void;
  defaultSelected?: { categoryId: string; subCategoryId: string }[];
}

export default function CategoryFilter({
  type = 'both',
  onSelectionChange,
  defaultSelected = []
}: CategoryFilterProps) {
  const [open, setOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(defaultSelected);

  const categories = type === 'both' 
    ? [...serviceCategories, ...craftCategories]
    : type === 'service' 
      ? serviceCategories 
      : craftCategories;

  const toggleCategory = (categoryId: string, subCategoryId: string) => {
    const isSelected = selectedCategories.some(
      cat => cat.categoryId === categoryId && cat.subCategoryId === subCategoryId
    );

    let newSelected;
    if (isSelected) {
      newSelected = selectedCategories.filter(
        cat => !(cat.categoryId === categoryId && cat.subCategoryId === subCategoryId)
      );
    } else {
      newSelected = [...selectedCategories, { categoryId, subCategoryId }];
    }

    setSelectedCategories(newSelected);
    onSelectionChange(newSelected);
  };

  const getSelectedLabels = () => {
    return selectedCategories.map(selected => {
      const category = categories.find(cat => cat.id === selected.categoryId);
      const subCategory = category?.subCategories?.find(sub => sub.id === selected.subCategoryId);
      return subCategory?.name || '';
    });
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
            {selectedCategories.length > 0
              ? `${selectedCategories.length} selected`
              : "Select categories..."}
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
                  const isSelected = selectedCategories.some(
                    cat => cat.categoryId === category.id && cat.subCategoryId === subCategory.id
                  );
                  
                  return (
                    <CommandItem
                      key={`${category.id}-${subCategory.id}`}
                      onSelect={() => toggleCategory(category.id, subCategory.id)}
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
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {getSelectedLabels().map((label, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="text-sm"
            >
              {label}
            </Badge>
          ))}
        </div>
      )}
    </Popover>
  );
}
