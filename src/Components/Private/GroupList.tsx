import React, { useEffect, useState } from 'react';
import * as BS from 'react-bootstrap';
import { API_V2_URL } from "../../Constants/constants.js";
import PKAPI from "../../API/index"
import Group from '../../API/group.js';
import { FaSearch } from "react-icons/fa";

export default function GroupList() {

    const [isLoading, setIsLoading ] = useState(true);
    const [isError, setIsError ] = useState(false);
    const [ errorMessage, setErrorMessage] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [groupsPerPage, setGroupsPerPage] = useState(25);

    const [groups, setGroups ] = useState([]);

    const [searchBy, setSearchBy] = useState('name')
    const [sortBy, setSortBy] = useState('name')
    const [sortOrder, setSortOrder] = useState('ascending')

    const [value, setValue] = useState('');

    var api = new PKAPI(API_V2_URL);
    
    useEffect(() => {
        fetchGroups();
    }, []);

    async function fetchGroups() {
        try {
            var res: Group[] = await api.getGroupList({token: localStorage.getItem('token')});
            setGroups(res);
            console.log(res);
            setIsLoading(false);
        } catch (error) {
            console.log(error);
            setErrorMessage(error.message);
            setIsError(true);
            setIsLoading(false);
        }
    }

    const indexOfLastGroup = currentPage * groupsPerPage;
    const indexOfFirstGroup = indexOfLastGroup - groupsPerPage;

    

    const Groups = groups.map(group => {
        if (group.display_name) {
            group = {...group, displayName: group.display_name}
        } else group = {...group, displayName: group.name}
        if (group.description) {
            group = {...group, desc: group.description}
        } else group = {...group, desc: "(no description)"}
        return group;
    });

    const filteredGroups = Groups.filter(group => {
        if (!value) return true;
        
        switch(searchBy) {
            case 'name':
                if (group.name.toLowerCase().includes(value.toLowerCase())) return true;
                break;
            case 'display name':
                if (group.displayName.toLowerCase().includes(value.toLowerCase())) return true;
                break;
            case 'description':
                if (group.desc.toLowerCase().includes(value.toLowerCase())) return true;
                break;
            case 'ID':
                if (group.id.toLowerCase().includes(value.toLowerCase())) return true;
                break;
        }
        return false;
    });

    const pageAmount = Math.ceil(filteredGroups.length / groupsPerPage);

    let sortedGroups = filteredGroups;
    switch(sortBy) {
        case 'name':
            sortedGroups = filteredGroups.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'display name':
            sortedGroups = filteredGroups.sort((a, b) => a.displayName.localeCompare(b.name));
            break;
        case 'id':
            sortedGroups = filteredGroups.sort((a, b) => a.id.localeCompare(b.name));
            break;
    }

    if (sortOrder === 'descending') {
        sortedGroups = sortedGroups.reverse();
    }

    const slicedGroups = sortedGroups.slice(indexOfFirstGroup, indexOfLastGroup);

    const groupsList = slicedGroups.map(group => <><span>{group.name} | {group.displayName} | {group.id}</span><br/></>)
    
    return(
    <>
    <BS.Card className="mb-4">
    <BS.Card.Header className="d-flex align-items-center">
        <BS.Button variant="link" className="float-left"><FaSearch className="mr-4"/>Group Search</BS.Button>
    </BS.Card.Header>
    <BS.Card.Body>
    <BS.Row className="mb-lg-3 justfiy-content-md-center">
      <BS.Col xs={12} lg={3}>
      <BS.Form>
        <BS.InputGroup className="mb-3">
        <BS.Form.Control disabled placeholder='Page length:'/>
          <BS.Form.Control as="select" defaultValue={localStorage.getItem("expandcards") ? 10 : 25} onChange={e => {
            setGroupsPerPage(parseInt(e.target.value));
            setCurrentPage(1);
            }}>
            <option>10</option>
            <option>25</option>
            <option>50</option>
            <option>100</option>
          </BS.Form.Control>
          </BS.InputGroup>
      </BS.Form>
      </BS.Col>
      <BS.Col xs={12} lg={3}>
      <BS.Form>
        <BS.InputGroup className="mb-3">
        <BS.Form.Control disabled placeholder='Search by:'/>
          <BS.Form.Control as="select" defaultValue={searchBy} onChange={e => {
            setSearchBy(e.target.value)
            }}>
            <option>name</option>
            <option>display name</option>
            <option>description</option>
            <option>ID</option>
          </BS.Form.Control>
          </BS.InputGroup>
      </BS.Form>
      </BS.Col>
      <BS.Col xs={12} lg={3}>
      <BS.Form>
        <BS.InputGroup className="mb-3">
        <BS.Form.Control disabled placeholder='Sort by:'/>
          <BS.Form.Control as="select" defaultValue={sortBy} onChange={e => {
            setSortBy(e.target.value)
            }}>
            <option>name</option>
            <option>display name</option>
            <option>ID</option>
          </BS.Form.Control>
          </BS.InputGroup>
      </BS.Form>
      </BS.Col>
      <BS.Col xs={12} lg={3}>
        <BS.Form>
          <BS.InputGroup className="mb-3">
          <BS.Form.Control disabled placeholder='Sort order:'/>
            <BS.Form.Control as="select" defaultValue={sortOrder} onChange={e => {
              setSortOrder(e.target.value)
              }}>
              <option>ascending</option>
              <option>descending</option>
            </BS.Form.Control>
            </BS.InputGroup>
        </BS.Form>
        </BS.Col>
      </BS.Row>
      <BS.Row className="justify-content-md-center">
      <BS.Col className="mb-3" xs={12} lg={7}>
      <BS.Form>
          <BS.Form.Control value={value} onChange={e => {setValue(e.target.value); setCurrentPage(1);}} placeholder={`Search by ${searchBy}`}/>
      </BS.Form>
      </BS.Col>
      <BS.Col className="mb-3" xs={12} lg={2}>
        <BS.Button type="primary" className="m-0" block onClick={() => fetchGroups()}>Refresh</BS.Button>
      </BS.Col>
      </BS.Row>
      </BS.Card.Body>
      </BS.Card>
      <BS.Row className="justify-content-md-center">
        <BS.Pagination className="ml-auto mr-auto">
            { currentPage === 1 ? <BS.Pagination.Prev disabled/> : <BS.Pagination.Prev onClick={() => setCurrentPage(currentPage - 1)} />}
            { currentPage < 3 ? "" : <BS.Pagination.Item  onClick={() => setCurrentPage(1)} active={1 === currentPage}>{1}</BS.Pagination.Item>}
            { currentPage < 4 ? "" : currentPage < 5 ? <BS.Pagination.Item  onClick={() => setCurrentPage(2)} active={2 === currentPage}>{2}</BS.Pagination.Item> : <BS.Pagination.Ellipsis disabled />}
            { currentPage > 1 ? <BS.Pagination.Item  onClick={() => setCurrentPage(currentPage - 1)}>{currentPage - 1}</BS.Pagination.Item> : "" }
            <BS.Pagination.Item  onClick={() => setCurrentPage(currentPage)} active={currentPage === currentPage}>{currentPage}</BS.Pagination.Item>
            { currentPage < pageAmount ? <BS.Pagination.Item  onClick={() => setCurrentPage(currentPage + 1)}>{currentPage + 1}</BS.Pagination.Item> : "" }
            { currentPage > pageAmount - 3 ? "" : currentPage === pageAmount - 3 ? <BS.Pagination.Item  onClick={() => setCurrentPage(pageAmount - 1)} active={pageAmount - 1 === currentPage}>{pageAmount - 1}</BS.Pagination.Item> : <BS.Pagination.Ellipsis disabled />}
            { currentPage > pageAmount - 2 ? "" : <BS.Pagination.Item  onClick={() => setCurrentPage(pageAmount)} active={pageAmount === currentPage}>{pageAmount}</BS.Pagination.Item>}
            { currentPage === pageAmount ? <BS.Pagination.Next disabled /> :<BS.Pagination.Next onClick={() => setCurrentPage(currentPage + 1)} />}
        </BS.Pagination>
      </BS.Row>
        {groupsList}
    <BS.Row className="justify-content-md-center">
        <BS.Pagination className="ml-auto mr-auto">
            { currentPage === 1 ? <BS.Pagination.Prev disabled/> : <BS.Pagination.Prev onClick={() => setCurrentPage(currentPage - 1)} />}
            { currentPage < 3 ? "" : <BS.Pagination.Item  onClick={() => setCurrentPage(1)} active={1 === currentPage}>{1}</BS.Pagination.Item>}
            { currentPage < 4 ? "" : currentPage < 5 ? <BS.Pagination.Item  onClick={() => setCurrentPage(2)} active={2 === currentPage}>{2}</BS.Pagination.Item> : <BS.Pagination.Ellipsis disabled />}
            { currentPage > 1 ? <BS.Pagination.Item  onClick={() => setCurrentPage(currentPage - 1)}>{currentPage - 1}</BS.Pagination.Item> : "" }
            <BS.Pagination.Item  onClick={() => setCurrentPage(currentPage)} active={currentPage === currentPage}>{currentPage}</BS.Pagination.Item>
            { currentPage < pageAmount ? <BS.Pagination.Item  onClick={() => setCurrentPage(currentPage + 1)}>{currentPage + 1}</BS.Pagination.Item> : "" }
            { currentPage > pageAmount - 3 ? "" : currentPage === pageAmount - 3 ? <BS.Pagination.Item  onClick={() => setCurrentPage(pageAmount - 1)} active={pageAmount - 1 === currentPage}>{pageAmount - 1}</BS.Pagination.Item> : <BS.Pagination.Ellipsis disabled />}
            { currentPage > pageAmount - 2 ? "" : <BS.Pagination.Item  onClick={() => setCurrentPage(pageAmount)} active={pageAmount === currentPage}>{pageAmount}</BS.Pagination.Item>}
            { currentPage === pageAmount ? <BS.Pagination.Next disabled /> :<BS.Pagination.Next onClick={() => setCurrentPage(currentPage + 1)} />}
        </BS.Pagination>
      </BS.Row>
        </>
    )
}