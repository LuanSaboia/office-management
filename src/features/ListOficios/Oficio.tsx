import React, { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Box,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import './Oficio.css'
import { useNavigate } from 'react-router-dom'
import supabase from '../../utils/supabase'

interface Oficio {
  id: number
  numero: string
  ano: string | number
  remetente: string
  destinatario: string
  cidade: string
  utilizado: boolean
  descricao?: string
}

const Oficio: React.FC = () => {
  const navigate = useNavigate()
  const [oficios, setOficios] = useState<Oficio[]>([])
  const [filteredOficios, setFilteredOficios] = useState<Oficio[]>([])
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [yearFilter, setYearFilter] = useState<string>('')
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false)
  const [selectedOficio, setSelectedOficio] = useState<Oficio | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  // 🟢 Buscar ofícios direto do Supabase
  const fetchOficios = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('oficios')
      .select('*')
      .order('numero', { ascending: true })

    if (error) {
      console.error('Erro ao buscar ofícios:', error)
      alert('Erro ao buscar os ofícios.')
    } else {
      setOficios(data || [])
      setFilteredOficios(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchOficios()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [yearFilter, searchTerm])

  const applyFilters = () => {
    let filtered = oficios
    if (yearFilter) {
      filtered = filtered.filter((oficio) => oficio.ano.toString().includes(yearFilter))
    }
    if (searchTerm) {
      filtered = filtered.filter((oficio) =>
        Object.values(oficio).some((value) =>
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }
    setFilteredOficios(filtered)
  }

  const handleEdit = (oficio: Oficio) => {
    setSelectedOficio(oficio)
    setOpenEditDialog(true)
  }

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false)
    setSelectedOficio(null)
  }

  // 🟡 Atualizar ofício direto no Supabase
  const handleSaveEdit = async () => {
    if (selectedOficio) {
      const { error } = await supabase
        .from('oficios')
        .update({
          ano: selectedOficio.ano,
          remetente: selectedOficio.remetente,
          destinatario: selectedOficio.destinatario,
          cidade: selectedOficio.cidade,
          descricao: selectedOficio.descricao,
          utilizado: selectedOficio.utilizado,
        })
        .eq('id', selectedOficio.id)

      if (error) {
        console.error('Erro ao atualizar o ofício:', error)
        alert('Erro ao atualizar o ofício.')
      } else {
        alert('Ofício atualizado com sucesso!')
        fetchOficios()
        handleCloseEditDialog()
      }
    }
  }

  return (
    <div className="container">
      <h1 className="title">Ofícios</h1>
      <div className="controls">
        <div className="filters">
          <TextField
            label="Pesquisa"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />
          <FormControl style={{ minWidth: 120 }}>
            <InputLabel>Ano</InputLabel>
            <Select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value as string)}
            >
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              {Array.from(new Set(oficios.map((oficio) => oficio.ano.toString()))).map((ano) => (
                <MenuItem key={ano} value={ano}>
                  {ano}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" color="primary" onClick={applyFilters}>
            Filtrar
          </Button>
        </div>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/add')}
        >
          Adicionar Ofício
        </Button>
      </div>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100px">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} className="table-container">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Número do Ofício</TableCell>
                <TableCell>Ano</TableCell>
                <TableCell>Remetente</TableCell>
                <TableCell>Destinatário</TableCell>
                <TableCell>Cidade</TableCell>
                <TableCell>Utilizado</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOficios.map((oficio) => (
                <TableRow key={oficio.id}>
                  <TableCell>{oficio.numero}</TableCell>
                  <TableCell>{oficio.ano}</TableCell>
                  <TableCell>{oficio.remetente}</TableCell>
                  <TableCell>{oficio.destinatario}</TableCell>
                  <TableCell>{oficio.cidade}</TableCell>
                  <TableCell>{oficio.utilizado ? 'Sim' : 'Não'}</TableCell>
                  <TableCell>{oficio.descricao || ''}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleEdit(oficio)}>
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )).reverse()}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Editar Ofício</DialogTitle>
        <DialogContent>
          <TextField
            label="Ano"
            value={selectedOficio?.ano || ''}
            onChange={(e) =>
              setSelectedOficio({ ...selectedOficio, ano: e.target.value } as Oficio)
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Remetente"
            value={selectedOficio?.remetente || ''}
            onChange={(e) =>
              setSelectedOficio({ ...selectedOficio, remetente: e.target.value } as Oficio)
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Destinatário"
            value={selectedOficio?.destinatario || ''}
            onChange={(e) =>
              setSelectedOficio({ ...selectedOficio, destinatario: e.target.value } as Oficio)
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Cidade"
            value={selectedOficio?.cidade || ''}
            onChange={(e) =>
              setSelectedOficio({ ...selectedOficio, cidade: e.target.value } as Oficio)
            }
            fullWidth
            margin="normal"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedOficio?.utilizado || false}
                onChange={(e) =>
                  setSelectedOficio({ ...selectedOficio, utilizado: e.target.checked } as Oficio)
                }
              />
            }
            label="Utilizado"
          />
          <TextField
            label="Descrição"
            value={selectedOficio?.descricao || ''}
            onChange={(e) =>
              setSelectedOficio({ ...selectedOficio, descricao: e.target.value } as Oficio)
            }
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancelar</Button>
          <Button onClick={handleSaveEdit}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default Oficio
