import React from 'react';
import ReactDOM from 'react-dom';
import { ipcRenderer } from 'electron';

import Column from './components/Column';
import Grid from './components/Grid';
import Preview from './components/Preview';

const time = ipcRenderer.sendSync('synchronous-message', 'get_time');

export default class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			data: {
				details: 'Using MyRPC',
				state: 'Being totally awesome',
				largeImageText: 'MyRPC',
				smallImageText: 'Made by RailRunner16',
				largeImageKey: 'large_default',
				smallImageKey: 'small_default',
				startTime: time,
			},
			images: null,
		};

		this.updateData = this.updateData.bind(this);
	}

	updateData(e) {
		const data = this.state.data;

		data[e.target.name] = e.target.value;

		this.setState({
			data
		});
	}

	async componentWillMount() {
		const resp = await fetch('http://165.227.63.75:3500/images');
		const body = await resp.json();

		this.setState({
			images: body
		});
	}

	render() {
		return (
			<div>
				<Grid>
					<Column>
						<div className="ui form">
							<div className="input">
								<label htmlFor="details">Details</label>
								<input type="text" name="details" onChange={this.updateData} value={this.state.data.details}/>
							</div>
							<div className="input">
								<label htmlFor="state">State</label>
								<input type="text" name="state" onChange={this.updateData} value={this.state.data.state}/>
							</div>
							<div className="input">
								<label htmlFor="largeImageText">Large Image Text</label>
								<input type="text" name="largeImageText" onChange={this.updateData} value={this.state.data.largeImageText}/>
							</div>
							<div className="input">
								<label htmlFor="smallImageText">Small Image Text</label>
								<input type="text" name="smallImageText" onChange={this.updateData} value={this.state.data.smallImageText}/>
							</div>
							<div className="input">
								<label htmlFor="largeImageKey">Large Image</label>
								<select name="largeImageKey" ref="largeImageKey" onChange={this.updateData}>
									{this.state.images ? this.state.images.map((image, index) => 
										<option selected={index === 0} key={index} value={image.id}>{image.name}</option>
									) : ''}
								</select>
							</div>
							<div className="input">
								<label htmlFor="smallImageKey">Small Image</label>
								<select name="smallImageKey" ref="smallImageKey" onChange={this.updateData}>
									{this.state.images ? this.state.images.map((image, index) => 
										<option selected={index === 0} key={index} value={image.id}>{image.name}</option>
									) : ''}
								</select>
							</div>

							<button onClick={() => ipcRenderer.send('asynchronous-message', this.state.data)}>Make it So!</button>
						</div>
					</Column>
					<Column>
						<Preview {...this.state.data} />
					</Column>
				</Grid>
			</div>
		);
	}
};
