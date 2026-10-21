import { Box, Button, Container, FormControl, FormLabel, Grid, Heading, Input } from '@chakra-ui/react'
import { FaBuilding, FaSave, FaSlidersH } from 'react-icons/fa'
import '../../styles/admin-settings.css'

function AdminSettings() {
  return (
    <Container className="admin-settings" maxW="1500px" px={0}>
      <header className="settings-heading">
        <div>
          <p>Administration</p>
          <h1>Settings</h1>
          <span>Manage your company profile and default preferences.</span>
        </div>
      </header>

      <section className="settings-summary" aria-label="Settings overview">
        <div className="settings-summary-icon"><FaSlidersH aria-hidden="true" /></div>
        <div>
          <strong>General Settings</strong>
          <span>Business details and default billing preferences</span>
        </div>
      </section>

      <Box className="settings-panel">
        <header className="settings-panel-heading">
          <div className="settings-panel-icon"><FaBuilding aria-hidden="true" /></div>
          <div>
            <Heading as="h2">Company Information</Heading>
            <p>Update the basic details used throughout your admin workspace.</p>
          </div>
        </header>

        <div className="settings-panel-content">
          <Grid className="settings-fields" templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }} gap={5}>
            <FormControl>
              <FormLabel>Company Name</FormLabel>
              <Input defaultValue="OM Enterprises" />
            </FormControl>
            <FormControl>
              <FormLabel>Support Email</FormLabel>
              <Input type="email" defaultValue="hello@omenterprises.com" />
            </FormControl>
            <FormControl>
              <FormLabel>Default Currency</FormLabel>
              <Input defaultValue="INR" />
            </FormControl>
            <FormControl>
              <FormLabel>Service Tax</FormLabel>
              <Input defaultValue="18%" />
            </FormControl>
          </Grid>
        </div>

        <footer className="settings-panel-footer">
          <span>Settings are currently displayed as defaults and are not saved to the database.</span>
          <Button className="settings-save-button" type="button">
            <FaSave aria-hidden="true" />
            Save Settings
          </Button>
        </footer>
      </Box>
    </Container>
  )
}

export default AdminSettings
