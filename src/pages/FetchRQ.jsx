import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { deletePost, fetchPosts, updatePost } from '../API/api'
import { NavLink } from 'react-router-dom'

const FetchRQ = () => {
  const [pageNumber, setPageNumber] = useState(0);  
  const queryClient = useQueryClient()
  const {data, isPending, isError, error} =  useQuery({
    queryKey:["posts",pageNumber],
    queryFn: () =>  fetchPosts(pageNumber),
    placeholderData:keepPreviousData, // no need to show loading text keep the previous data while fetching the next data
    // staleTime:5000,
    // refetchInterval:1000,
    // refetchIntervalInBackground:true
  })

  // mutation function to delete
  const deleteMutation = useMutation({
    mutationFn: (id) => deletePost(id),
    onSuccess: (data,id) => {
        queryClient.setQueryData(["posts",pageNumber], (curElem) => {
           return curElem?.filter((post) => post?.id !== id)
        })
    }
  })

    // mutation function to update
    const updateMutation = useMutation({
      mutationFn: (id) => updatePost(id),
      onSuccess: (data,id) => {
        queryClient.setQueryData(['posts',pageNumber], (curElem) => {
          return curElem?.map((curPost) =>  {
            return curPost?.id === id ? {...curPost, title: data?.data?.title} : curPost;
          })
        })
      }
    })

  if (isPending) {
    return <p>Loading...</p>
  }

  if (isError) {
    return <p>{error.message}</p>
  }

  return (
    <div>
      <ul className="section-accordion">
        {data?.map((curElem) => {
          const { id, title, body } = curElem;
          return (
            <li key={id}>
              <NavLink to={`/rq/${id}`}>
                <p>{id}</p>
                <p>{title}</p>
                <p>{body}</p>
              </NavLink>
              <button onClick={() => deleteMutation.mutate(id)}>Delete</button>
              <button onClick={() => updateMutation.mutate(id)}>Update</button>
            </li>
          );
        })}
      </ul>

      <div className='pagination-section container'>
        <button onClick={() => setPageNumber((prev) => prev - 3)} disabled={pageNumber === 0}>Prev</button>
          <h2 style={{color:"white"}}>{(pageNumber / 3) + 1}</h2>
        <button onClick={() => setPageNumber((prev) => prev + 3)}>Next</button>
      </div>
</div>
  )
}

export default FetchRQ