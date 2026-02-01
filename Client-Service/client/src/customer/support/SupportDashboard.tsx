import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Tabs,
    Tab,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    TextField,
    InputAdornment,
    Grid,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress
} from '@mui/material';
import {
    Search,
    Add as AddIcon,
    Chat,
    QuestionAnswer,
    Assignment,
    Visibility
} from '@mui/icons-material';
import supportService, { SupportTicket, FAQ } from '../../services/supportService';
import AuthStorage from '../../services/authStorage';
import { useNavigate } from 'react-router-dom';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const SupportDashboard: React.FC = () => {
    const [value, setValue] = useState(0);
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const userId = AuthStorage.getUser()?.userId;

    useEffect(() => {
        if (userId) {
            fetchTickets();
            fetchFAQs();
        }
    }, [userId]);

    const fetchTickets = async () => {
        try {
            const data = await supportService.getUserTickets(userId!);
            setTickets(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchFAQs = async () => {
        try {
            const data = await supportService.getFAQs();
            setFaqs(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (searchQuery.trim()) {
            try {
                const results = await supportService.searchFAQs(searchQuery);
                setFaqs(results);
            } catch (err) {
                console.error(err);
            }
        } else {
            fetchFAQs();
        }
    };

    const handleChatStart = async () => {
        try {
            if (userId) {
                const session = await supportService.startChatSession(userId);
                navigate(`/support/chat/${session.sessionId}`);
            }
        } catch (err) {
            alert("Failed to start chat session");
        }
    };

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    if (loading) {
        return <Box p={3}><CircularProgress /></Box>;
    }

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" sx={{ color: '#1a237e', fontWeight: 'bold' }}>
                    Help & Support
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Chat />}
                    onClick={handleChatStart}
                >
                    Live Chat
                </Button>
            </Box>

            <Paper sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={value} onChange={handleChange} aria-label="support tabs">
                        <Tab label="My Tickets" icon={<Assignment />} iconPosition="start" />
                        <Tab label="FAQs" icon={<QuestionAnswer />} iconPosition="start" />
                    </Tabs>
                </Box>

                <TabPanel value={value} index={0}>
                    <Box display="flex" justifyContent="flex-end" mb={2}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/support/new-ticket')}
                        >
                            New Ticket
                        </Button>
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Ticket ID</TableCell>
                                    <TableCell>Subject</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Priority</TableCell>
                                    <TableCell>Last Updated</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tickets.map((ticket) => (
                                    <TableRow key={ticket.ticketId}>
                                        <TableCell>#{ticket.ticketId.substring(0, 8)}</TableCell>
                                        <TableCell>{ticket.subject}</TableCell>
                                        <TableCell>{ticket.category}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={ticket.status}
                                                size="small"
                                                color={ticket.status === 'RESOLVED' ? 'success' : ticket.status === 'OPEN' ? 'error' : 'warning'}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={ticket.priority}
                                                size="small"
                                                variant="outlined"
                                                color={ticket.priority === 'URGENT' ? 'error' : 'default'}
                                            />
                                        </TableCell>
                                        <TableCell>{new Date(ticket.updatedAt).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Button size="small" onClick={() => navigate(`/support/tickets/${ticket.ticketId}`)}>
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {tickets.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">No tickets found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>

                <TabPanel value={value} index={1}>
                    <Box mb={4}>
                        <TextField
                            fullWidth
                            placeholder="Search help articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Button onClick={handleSearch}>Search</Button>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Box>
                    <Grid container spacing={2}>
                        {faqs.map((faq) => (
                            <Grid item xs={12} key={faq.id}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom color="primary">
                                            {faq.question}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {faq.answer}
                                        </Typography>
                                        <Box mt={2}>
                                            <Chip label={faq.category} size="small" />
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </TabPanel>
            </Paper>
        </Box>
    );
};

export default SupportDashboard;
