import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';

const Profile = () => {
  const [employee, setEmployee] = useState(null);
  const [certifications, setCertifications] = useState([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [about, setAbout] = useState("");
  const { id } = useParams();

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/profile/${id}`, {
          withCredentials: true
        });
        setEmployee(data.employee);
        setAbout(data.employee.about);
        setCertifications(data.certifications);
        setIsOwnProfile(data.isOwnProfile);
      } catch (err) {
        console.log(err.response.data.error);
      }
    }

    fetchEmployee();
  }, [id]);

  const saveChanges = async () => {  
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/profile/${id}`,
        {
          about
        },
        {
          withCredentials: true
        }
      );

      setEmployee({
        ...employee,
        about
      });
      setIsEditing(false);
    } catch (error) {
      console.log(error.response);
    }
  };

  if (!employee) {
    return (
      <></>
    );
  }

  return (
    <>
      <div className="flex flex-col w-full px-10 py-5 gap-5">
        <h1 className="text-xl font-bold">{employee.name}</h1>

        <div className="flex gap-16 justify-center">
          <div 
            className="w-[32rem] h-[32rem] aspect-square bg-cover bg-no-repeat"
            style={{ backgroundImage: `url(${employee.image})` }}
          />

          <div className="flex flex-col gap-5 w-[50%]">
            <div className="flex flex-col gap-2">
              {isOwnProfile ? (
                <div className="flex justify-between items-center">
                  <span className="underline">About</span>
                  {isEditing ? (
                    <CloseIcon 
                      className="cursor-pointer" 
                      onClick={() => {
                        setAbout(employee.about);
                        setIsEditing(false);
                      }}
                    />
                  ) : (
                    <EditIcon 
                      className="cursor-pointer" 
                      onClick={() => setIsEditing(true)}
                    />
                  )}
                </div>
              ) : (
                <span className="underline">About</span>
              )}

              {isEditing ? (
                <textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className="p-5 rounded-md border"
                />
              ) : (
                <p className="break-words p-5 rounded-md border" dangerouslySetInnerHTML={{__html: employee.about}} />
              )}
            </div>

            <div>
              <span className="underline">Position:</span>
              <span> {employee.position}</span>
            </div>

            <div>
              <span className="underline">Email:</span>
              <span> {employee.email}</span>
            </div>

            <div>
              <span className="underline">Status:</span>
              <span> {employee.status}</span>
            </div>

            <div>
              <span className="underline">Department:</span>
              <span> {employee.department}</span>
            </div>

            <div>
              <span className="underline">Certifications:</span>
              <div className="flex flex-wrap gap-2 mt-4">
                {certifications.map((certification) => {
                  return (
                    <div 
                      key={certification.id}
                      className="text-sm px-5 py-2 rounded-full bg-gray-400 text-white"
                    >
                      <span>{certification.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {isEditing && (
              <button 
                onClick={saveChanges}
                className="text-white px-5 py-3 rounded-md bg-blue-500 cursor-pointer hover:bg-blue-600"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
