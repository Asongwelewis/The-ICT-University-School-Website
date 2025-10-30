nt'

imp
import { useAuthh'
import { Button } from 'on'
import {
import { Progress ress'
import { X, FileText, Users, Calendar, Award } from 'lucide-react'
import Link from 'next/l

interface Course {
  id: string
  code: string
  name: string
  credits: number
  instructor?: string
  students?: number
  schedule: string
  status: 
  progress?: number
  description?: string
  totalNotes?: number
  completedNotes?: number
}

interface CourseDetailsModalProps {
| null
  isOpen: boolean
  onClose: d
}

export function CourseDetailsModal({ cous) {
  const { user } = useAuth()
  const [notesProgress, setNotesProgress] = useState(0)

  useEffect(() => {
    if (course && course.totalN
      const progress = Math.round((course.completedNot
      setNotesProgress(pro
    } else {
      setNs || 0)
    }
  }, [course])

  if (!isOpen || !course) return null

  const getStatusColor = (status: strig) => {
    switch (status) {
      case 'active': return 'bg-green-100 text
      case 'completed0'
      case 'upcoming': return 'bg-orange-100 te800'
      default: return 'bg-gray-100 textay-800'
   }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center
      <div 
       -sm"
        onClick={onClose}
      />
      
      <div cla
        <div className="flex items-center justify-between p">
          <div>
            <h2 className="text-22>
  
         
          <but
            onClick={o
            classs"
          >
            <X className="h-5 w" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between"
            <Ba>
              {course.status}
            </Badge>
            <div className="text-sm text-gray-500">
              {course.credits} C
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {course.inst& (
              <div className="f
                <Users className="h-5 w-5 text-gray-400" /
>
            
             
                </div>
          div>
            )}

            <div className=">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-grap>
               
 </div>
            </div>
          </div>

          {user?.role === 'student' && (
            <div>
              <div className="flex items-center justify-betwee
                <h3 className="font-semibold text-gray-
                  <Award classN>
    ogress
               h3>
                0">
                  {notesProgress}%
                </span>
              </div>
              <Progress value={notesProgress} className="h-3" />
              <div className="flex justify-bet>
an>
          d
                <
                <span>
                  {notesProgress === 100 ? 'Course Complete!' : g`}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-y-200">
            <Link

              c
              onClick}
            >
              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
        >
                📚 Course Notes
              </Button>
ink>
          </div>

          <div className="grid grid-cols-3 gap-
            <div className="text-center">
              <div className">
                {course12}
              </div>
              <div className="text-xs text-gray-500">Tv>
            </div>
            <div className="text-center">
              <div clas00">

              <v>
              <d
            </div>
            <dnter">
              <div className="text-2xl">
                {notesProgress}%
              </div>
          
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}