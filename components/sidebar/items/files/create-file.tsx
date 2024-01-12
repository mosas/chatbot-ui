import { ACCEPTED_FILE_TYPES } from "@/components/chat/chat-hooks/use-select-file-handler"
import { SidebarCreateItem } from "@/components/sidebar/items/all/sidebar-create-item"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChatbotUIContext } from "@/context/context"
import { FILE_DESCRIPTION_MAX, FILE_NAME_MAX } from "@/db/limits"
import { TablesInsert } from "@/supabase/types"
import { FC, useContext, useState } from "react"

interface CreateFileProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const CreateFile: FC<CreateFileProps> = ({ isOpen, onOpenChange }) => {
  const { profile, selectedWorkspace } = useContext(ChatbotUIContext)
  const formatDate = (date: Date): string => {
    const d = new Date(date),
      month = d.getMonth() + 1,
      day = d.getDate(),
      year = d.getFullYear(),
      hour = d.getHours(),
      minute = d.getMinutes(),
      second = d.getSeconds();

    return [
      month.toString().padStart(2, '0'),
      day.toString().padStart(2, '0'),
      hour.toString().padStart(2, '0'),
      minute.toString().padStart(2, '0'),
      second.toString().padStart(2, '0'),
      year.toString()
    ].join('_');
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const currentDate = formatDate(new Date())

    const handleSelectedFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return

      const file = e.target.files[0]

      if (!file) return

      setSelectedFile(file)
      const fileExtension = file.name.split('.').pop() || '';

      const fileNameWithoutExtension = file.name.split(".").slice(0, -1).join(".")
      const containsNonAlphanumeric = /[^a-zA-Z0-9_]/.test(fileNameWithoutExtension)

      if (containsNonAlphanumeric) {
        // If non-alphanumeric characters are found, rename the file
        setName(`File_${currentDate}.${fileExtension}`)
        setDescription(file.name) // Set the original file name as the description
      } else {
        setName(fileNameWithoutExtension)
        setDescription("") // Clear the description if the file name is alphanumeric
      }
    }

    if (!profile) return null
    if (!selectedWorkspace) return null

    return (
      <SidebarCreateItem
        contentType="files"
        createState={
          {
            file: selectedFile,
            user_id: profile.user_id,
            name,
            description,
            file_path: "",
            size: selectedFile?.size || 0,
            tokens: 0,
            type: selectedFile?.type || 0
          } as TablesInsert<"files">
        }
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        renderInputs={() => (
          <>
            <div className="space-y-1">
              <Label>File</Label>

              <Input
                type="file"
                onChange={handleSelectedFile}
                accept={ACCEPTED_FILE_TYPES}
              />
            </div>

            <div className="space-y-1">
              <Label>Name</Label>

              <Input
                placeholder="File name..."
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={FILE_NAME_MAX}
              />
            </div>

            <div className="space-y-1">
              <Label>Description (optional)</Label>

              <Input
                placeholder="File description..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                maxLength={FILE_DESCRIPTION_MAX}
              />
            </div>
          </>
        )}
      />
    )
  }
