const func = {
    
    clear: function(terminal, user, ...args)
    {
        if (args.length == 1 && args[0] == '-?')
        {
            terminal.print('clear : clears the terminal window.');
            return 0;
        }
        
        else if (args.length != 0) { return 1; }
        
        else
        {
            terminal.screen.buffer = [];
            terminal.screen.offset = 0;
            return 0;
        }
    },
    
    echo: function(terminal, user, ...args)
    {
        if (args.length == 1 && args[0] == '-?')
        {
            terminal.print('echo [args...] : outputs the arguments to the terminal window.');
            return 0;
        }
        
        else
        {
            terminal.print(args.join(' '));
            return 0;
        }
    },
    
    ls: function(terminal, user, ...args)
    {
        if (args.length == 1)
        {
            if (args[0] == '-?')
            {
                terminal.print('ls [directory] : lists the contents of the specified directory.');
                return 0;
            }
            
            // List the contents of the specified directory.
            else
            {
                const dir = user_get_dir(user, args[0]);
                
                if (!dir)
                {
                    terminal.print(`directory '${args[0]}' doesn't exist.`);
                    return 1;
                }
                
                if (dir.dirs.length == 0) { terminal.print('directories: none'); }
                else { terminal.print(`directories: ${dir.dirs.length}`); }
                
                for (var i = 0; i < dir.dirs.length; ++i)
                {
                    terminal.print(`'${dir.dirs[i].name}'`);
                }
                
                if (dir.files.length == 0) { terminal.print('\nfiles: none'); }
                else { terminal.print(`\nfiles: ${dir.files.length}`); }
                
                for (var i = 0; i < dir.files.length; ++i)
                {
                    terminal.print(`'${dir.files[i].name}' len: ${dir.files[i].contents.length}`);
                }
            }
        }
        
        // List the contents of the cwd.
        else if (args.length == 0)
        {
            const dir = user_get_dir(user, '.');
            
            if (dir.dirs.length == 0) { terminal.print('directories: none'); }
            else { terminal.print(`directories: ${dir.dirs.length}`); }
            
            for (var i = 0; i < dir.dirs.length; ++i)
            {
                terminal.print(`'${dir.dirs[i].name}'`);
            }
            
            if (dir.files.length == 0) { terminal.print('\nfiles: none'); }
            else { terminal.print(`\nfiles: ${dir.files.length}`); }
            
            for (var i = 0; i < dir.files.length; ++i)
            {
                terminal.print(`'${dir.files[i].name}' len: ${dir.files[i].contents.length}`);
            }
        }
        
        else { return 1; }
    },
    
    cd: function(terminal, user, ...args)
    {
        if (args.length == 1 && args[0] == '-?')
        {
            terminal.print('cd path : changes the current directory to the one specified.');
            return 0;
        }
        
        else if (args.length != 1) { return 1; }
        
        else
        {
            const dir = user_get_dir(user, args[0]);
            
            if (!dir)
            {
                terminal.print(`directory '${args[0]}' doesn't exist.`);
                return 1;
            }
            
            const dir_names = user_path_to_dir(user, dir).split('/');
            dir_names.shift();
            
            user.cwd = dir_names;
            return 0;
        }
    },
    
    md: function(terminal, user, ...args)
    {
        if (args.length == 1 && args[0] == '-?')
        {
            terminal.print('md directories... : creates the specified directories.');
            return 0;
        }
        
        else if (!args.length) { return 1; }
        
        else
        {
            for (var i = 0; i < args.length; ++i)
            {
                let dir_path = args[i].split('/');
                const name = dir_path.pop();
                
                if (name.startsWith('~') || name.length == 0 || /^\s*$/.test(name))
                {
                    terminal.print(`invalid directory name '${name}'.`);
                    return 1;
                }
                
                const dir = user_get_dir(user, dir_path.length == 0 ? '.' : dir_path.join('/'));
                
                if (!dir)
                {
                    terminal.print('the specified directory does not exist.');
                    return 1;
                }
                
                if (dir.dirs.find(dir => { return dir.name == name; }))
                {
                    terminal.print(`directory '${name}' already exists.`);
                    return 1;
                }
                
                dir.dirs.push({ name: name, prev: dir, files: new Array(), dirs: new Array() });
                dir.dirs.sort((a, b) => { return a.name.localeCompare(b.name); });
            }
            
            return 0;
        }
    },
    
    rd: function(terminal, user, ...args)
    {
        if (args.length == 1 && args[0] == '-?')
        {
            terminal.print('rd directories... : removes the specified directories.');
            return 0;
        }
        
        else if (!args.length) { return 1; }
        
        else
        {
            for (var i = 0; i < args.length; ++i)
            {
                let dir_path = args[i].split('/');
                const name = dir_path.pop();
                
                if (name.startsWith('~') || name.length == 0 || /^\s*$/.test(name))
                {
                    terminal.print(`invalid directory name '${name}'.`);
                    return 1;
                }
                
                const dir = user_get_dir(user, dir_path.length == 0 ? '.' : dir_path.join('/'));
                
                if (!dir)
                {
                    terminal.print('the specified directory does not exist.');
                    return 1;
                }
                
                if (name == '.' || name == '~')
                {
                    terminal.print('you cannot remove those directories.');
                    return 1;
                }
                
                if (!dir.dirs.find(dir => { return dir.name == name; }))
                {
                    terminal.print(`directory '${name}' doesn't exist.`);
                    return 1;
                }
                
                if (user_get_cwd(user).startsWith(user_path_to_dir(user, dir) + `/${name}`))
                {
                    terminal.print(`you can't delete the directory you are in.`);
                    return 1;
                }
                
                dir.dirs.splice(dir.dirs.find(dir => { return dir.name == name; }), 1);
                
                terminal.print(`directory '${name}' has been removed.`);
            }
            
            return 0;
        }
    },
    
    mk: function(terminal, user, ...args)
    {
        if (args.length == 1 && args[0] == '-?')
        {
            terminal.print('mk files... : creates the specified files.');
            return 0;
        }
        
        else if (!args.length) { return 1; }
        
        else
        {
            for (var i = 0; i < args.length; ++i)
            {
                let dir_path = args[i].split('/');
                const name = dir_path.pop();
                
                if (name.startsWith('~') || name.length == 0 || /^\s*$/.test(name))
                {
                    terminal.print(`invalid file name '${name}'.`);
                    return 1;
                }
                
                const dir = user_get_dir(user, dir_path.length == 0 ? '.' : dir_path.join('/'));
                
                if (!dir)
                {
                    terminal.print('the specified directory does not exist.');
                    return 1;
                }
                
                if (dir.files.find(file => { return file.name == name; }))
                {
                    terminal.print(`file '${name}' already exists.`);
                    return 1;
                }
                
                dir.files.push({ name: name, contents: '' });
                
                // Sort the files.
                dir.files.sort((a, b) => { return a.name.localeCompare(b.name); });
            }
            
            return 0;
        }
    },
    
    rm: function(terminal, user, ...args)
    {
        if (args.length == 1 && args[0] == '-?')
        {
            terminal.print('rm files... : removes the specified files.');
            return 0;
        }
        
        else if (!args.length) { return 1; }
        
        else
        {
            for (var i = 0; i < args.length; ++i)
            {
                let dir_path = args[i].split('/');
                const name = dir_path.pop();
                
                if (name.length == 0 || /^\s*$/.test(name))
                {
                    terminal.print(`invalid file name '${name}'.`);
                    return 1;
                }
                
                const dir = user_get_dir(user, dir_path.length == 0 ? '.' : dir_path.join('/'));
                
                if (!dir)
                {
                    terminal.print('the specified directory does not exist.');
                    return 1;
                }
                
                if (!dir.files.find(file => { return file.name == name; }))
                {
                    terminal.print(`file '${name}' doesn't exist.`);
                    return 1;
                }
                
                dir.files.splice(dir.files.find(file => { return file.name == name; }), 1);
                
                terminal.print(`file '${name}' has been removed.`);
            }
            
            return 0;
        }
    },
    
    write: function(terminal, user, ...args)
    {
        if (args.length == 1 && args[0] == '-?')
        {
            terminal.print('write files... : outputs the specified files.');
            return 0;
        }
        
        else if (!args.length) { return 1; }
        
        else
        {
            for (var i = 0; i < args.length; ++i)
            {
                let dir_path = args[i].split('/');
                const name = dir_path.pop();
                
                if (name.length == 0 || /^\s*$/.test(name))
                {
                    terminal.print('files cannot have empty names.');
                    return 1;
                }
                
                const dir = user_get_dir(user, dir_path.length == 0 ? '.' : dir_path.join('/'));
                
                if (!dir)
                {
                    return 1;
                }
                
                if (!dir.files.find(file => { return file.name == name; }))
                {
                    terminal.print(`file '${name}' doesn't exist.`);
                    return 1;
                }
                
                terminal.print(dir.files.find(file => { return file.name == name }).contents);
            }
            
            return 0;
        }
    },
    
    
    cwd: function(terminal, user, ...args)
    {
        if (args.length == 1 && args[0] == '-?')
        {
            terminal.print('cwd : the absolute path of the current directory.');
            return 0;
        }
        
        else if (args.length != 0) { return 1; }
        
        else
        {
            terminal.print(user_get_cwd(user));
            return 0;
        }
    },
    
    set: function(terminal, user, ...args)
    {
        if (args.length == 1 && args[0] == '-?')
        {
            terminal.print('set var = text... : assigns a value to \'var\'.');
            return 0;
        }
        
        else if (args.length < 3 || args[1] != '=') { return 1; }
        
        else
        {
            if (args[0] == 'cwd' || args[0] == '?')
            {
                terminal.print(`variable '${args[0]}' can't be set manually.`);
                return 1;
            }
            
            let v = user.vars.find(v => { return v.name == args[0]; })
            
            if (!v)
            {
                user.vars.push({ name: args[0], contents: args.slice(2) });
            }
            
            else { v.contents = args.slice(2); }
            
            user.vars.sort((a, b) => { return a.name.localeCompare(b.name); })
            return 0;
        }
    },
    
    rmvar: function(terminal, user, ...args)
    {
        if (args.length == 1 && args[0] == '-?')
        {
            terminal.print('rmvar vars... : unsets the specified variables.');
            return 0;
        }
        
        else if (!args.length) { return 1; }
        
        else
        {
            for (var i = 0; i < args.length; ++i)
            {
                const v = user.vars.find(v => { return v.name == args[i]; });
                
                if (!v)
                {
                    terminal.print(`variable '${args[i]}' doesn't exist.`);
                    return 1;
                }
                
                else
                {
                    user.vars.splice(v, 1);
                    terminal.print(`variable '${args[i]}' has been removed.`);
                }
            }
            
            return 0;
        }
    },
    
    vars: function(terminal, user, ...args)
    {
        if (args.length == 1 && args[0] == '-?')
        {
            terminal.print('vars : prints all of your active variables.');
            return 0;
        }
        
        else if (args.length != 0) { return 1; }
        
        else
        {
            if (!user.vars.length)
            {
                terminal.print('you have no variables defined.');
                return 0;
            }
            
            for (var i = 0; i < user.vars.length; ++i)
            {
                terminal.print(`'${user.vars[i].name}' : '${user.vars[i].contents.join(', ')}'`);
            }
            
            return 0;
        }
    },
    
    edit: async function(terminal, user, ...args)
    {
        if (args.length == 1 && args[0] == '-?')
        {
            terminal.print('edit file : edit the specified file in the text editor. (WIP)');
            return 0;
        }
        
        else if (args.length != 1) { return 1; }
        
        else
        {
            let dir_path = args[0].split('/');
            const file_name = dir_path.pop();
            
            if (file_name.startsWith('~') || file_name.length == 0 || /^\s*$/.test(file_name))
            {
                terminal.print(`invalid file name '${file_name}'.`);
                return 1;
            }
            
            const dir = user_get_dir(user, dir_path.length == 0 ? '.' : dir_path.join('/'));
            
            if (!dir)
            {
                terminal.print(`the specified directory does not exist.`);
                return 1;
            }
            
            let file = dir.files.find(file => { return file.name == file_name; });
            
            if (!file)
            {
                dir.files.push({ name: file_name, contents: '' });
                file = dir.files.find(file => { return file.name == file_name; });
            }
            
            terminal.screen.offset = 0;
            terminal.screen.buffer = [''];
            
            terminal.cursor = { x: 0, y: 0 };
            terminal.show_cursor = true;
            
            terminal.key_mode = true;
            
            let file_data = file.contents.split('\n');
            
            
            while (true)
            {
                
                
                terminal.draw();
                
                
                switch (await terminal.getkey())
                {
                case 'escape':
                    
                    file.contents = file_data.join('\n');
                    terminal.screen.buffer = [];
                    
                    return 0;
                    break;
                    
                case 'backspace':
                    
                    
                    break;
                    
                case 'enter':
                    
                    
                    break;
                    
                case 'home':
                    
                    
                    break;
                    
                case 'end':
                    
                    
                    break;
                    
                case 'page up':
                    
                    
                    break;
                    
                case 'page down':
                    
                    
                    break;
                    
                case 'up arrow':
                    
                    
                    break;
                    
                case 'shift up arrow':
                    
                    
                    break;
                    
                case 'down arrow':
                    
                    
                    break;
                    
                case 'shift down arrow':
                    
                    
                    break;
                    
                case 'left arrow':
                    
                    
                    break;
                    
                case 'shift left arrow':
                    
                    
                    break;
                    
                case 'right arrow':
                    
                    
                    break;
                    
                case 'shift right arrow':
                    
                    
                    break;
                    
                // Letters.
                default:
                    
                    
                    break;
                }
            }
        }
    },
    
    pause: async function(terminal, user, ...args)
    {
        if (args.length == 1 && args[0] == '-?')
        {
            terminal.print("pause : pauses the terminal until a key is pressed.");
            return 0;
        }
        
        else if (args.length != 0) { return 1; }
        
        else
        {
            terminal.print('press any key to contiue...');
            
            terminal.key_mode = true;
            
            await terminal.getkey();
            
            terminal.key_mode = false;
            return 0;
        }
    },
    
    wait: async function(terminal, user, ...args)
    {
        if (args.length == 1 && args[0] == '-?')
        {
            terminal.print('wait duration : wait for the specified number of milliseconds.');
            return 0;
        }
        
        else if (args.length != 1) { return 1; }
        
        else if (!args[0].match(/^[0-9]+$/))
        {
            terminal.print(`'${args[0]}' isn't a valid integer.`);
            return 1;
        }
        
        else
        {
            terminal.print('waiting...');
            
            await terminal.delay(parseInt(args[0]));
            return 0;
        }
    },
    
    
    snails: async function(terminal, user, ...args)
    {
        if (args.length == 1 && args[0] == '-?')
        {
            terminal.print('you know what it is...');
            return 0;
        }
        
        else if (args.length != 0) { return 1; }
        
        else
        {
            const row = '=....................#';
            
            let snails = [
                
                { name: 'Dave  ', pos: 1 },
                { name: 'John  ', pos: 1 },
                { name: 'Adam  ', pos: 1 },
                { name: 'Jeremy', pos: 1 },
                { name: 'Oscar ', pos: 1 },
            ];
            
            while (true)
            {
                terminal.screen.buffer = [''];
                terminal.screen.offset = 0;
                    
                for (var i = 0; i < snails.length; ++i)
                {
                    terminal.print('=============================');
                    terminal.print(`=${snails[i].name}` +
                        row.substring(0, snails[i].pos) + '@' +
                        row.substring(snails[i].pos + 1));
                }
                
                terminal.print('=============================');
                
                let count = [];
                
                for (var i = 0; i < snails.length; ++i)
                {
                    if (snails[i].pos == 21)
                    {
                        count.push(i);
                    }
                    
                    if (!Math.floor(Math.random() * 2))
                    {
                        ++snails[i].pos;
                    }
                }
                
                if (count.length != 0)
                {
                    if (count.length == 1)
                    {
                        terminal.print(snails[count[0]].name == 'Jeremy' ? `It's always ${snails[count[0]].name.trim()}!` : `${snails[count[0]].name.trim()} has won!`);
                    }
                    
                    else
                    {
                        let names = snails[count[0]].name.trim();
                        
                        count.slice(1, count.length - 1).forEach(c => { names += `, ${snails[c].name.trim()}`; })
                        
                        names += ` and ${snails[count[count.length - 1]].name.trim()}`;
                        
                        terminal.print(`It's a tie between ${names}.`);
                    }
                    
                    break;
                }
                
                await terminal.delay(750);
            }
            
            return 0;
        }
    },
    
    
    exit: function(terminal, user, ...args)
    {
        if (args.length == 1 && args[0] == '-?')
        {
            terminal.print('exit : exits the terminal window.');
            return 0;
        }
        
        else if (args.length != 0) { return 1; }
        
        else
        {
            window.location.replace('index.php');
            return 0; // Won't execute.
        }
    },
    
    help: function(terminal, user, ...args)
    {
        if (args.length == 0)
        {
            terminal.print(`welcome to the greatest terminal on all the web!\n` +
                `it is still pretty work-in-progress but it works just fine.\n` +
                `made by Alexander Nyberg at NTI Örebro.\n` +
                `email: alexander.nyberg@elev.ga.ntig.se\n` +
                `discord: Alexander Nyberg#8924.\n\n` +
                `commands:`);
            
            func.clear(terminal, user, '-?');
            func.echo(terminal, user, '-?');
            func.ls(terminal, user, '-?');
            func.cd(terminal, user, '-?');
            func.md(terminal, user, '-?');
            func.rd(terminal, user, '-?');
            func.mk(terminal, user, '-?');
            func.rm(terminal, user, '-?');
            func.write(terminal, user, '-?');
            func.cwd(terminal, user, '-?');
            func.set(terminal, user, '-?');
            func.rmvar(terminal, user, '-?');
            func.vars(terminal, user, '-?');
            func.edit(terminal, user, '-?');
            func.pause(terminal, user, '-?');
            func.wait(terminal, user, '-?');
            func.exit(terminal, user, '-?');
            
            return 0;
        }
        
        else { return 1; }
    },
};


let user = {
    
    root: {
        
        // { name: String, prev: Parent, dirs: [Child], files: [] }
        dirs: new Array(),
        
        // { name: String, contents: String }
        files: new Array(),
    },
    
    // [String]
    cwd: new Array(),
    
    // { name: String, contents: [String] }
    vars: new Array(),
};


function user_get_dir(user, path)
{
    // If the path isn't absolute, make it so.
    if (!path.startsWith('~'))
    {
        if (path == '.') { path = user_get_cwd(user); }
        
        else if (path.startsWith('.') && !path.startsWith('..'))
        {
            path = `${user_get_cwd(user)}${path.substring(1)}`;
        }
        
        else { path = `${user_get_cwd(user)}/${path}`; }
    }
    
    // This needs a special check since the substring afterwards would ruin it otherwise.
    if (path == '~') { return user.root; }
    
    let dir = user.root;
    
    let dir_names = path.substring(2).split('/');
    
    // Remove final empty elements so that 'cd ~/' works like 'cd ~'.
    if (dir_names[dir_names.length - 1].length == 0) { dir_names.pop(); }
    
    for (var i = 0; i < dir_names.length; ++i)
    {
        if (dir_names[i] == '..')
        {
            dir = dir.prev;
        }
        
        else { dir = dir.dirs.find(dir => { return dir.name == dir_names[i]; }); }
        
        if (!dir) { return null; }
    }
    
    return dir;
}

function user_path_to_dir(user, directory)
{
    let path = '';
    
    while (true)
    {
        if (!directory.prev)
        {
            path = `~/${path}`;
            break;
        }
        
        else
        {
            path = `${directory.name}/${path}`;
            directory = directory.prev;
        }
    }
    
    return path.endsWith('/') ? path.substring(0, path.length - 1) : path;
}

function user_get_cwd(user)
{
    if (user.cwd.length == 0) { return '~'; }
    else { return '~/' + user.cwd.join('/'); }
}


function user_to_string(user)
{
    // Since the directory objects are circular due to their prev member, they need to be removed here.
    return JSON.stringify(user, (key, value) => { return key == 'prev' || key == 'cwd' ? undefined : value; });
}

function user_from_string(string)
{
    let _user = JSON.parse(string);
    
    _user.cwd = [];
    
    // set_prev recursively sets the prev member of every directory, since user_to_string removes them.
    
    function set_prev(dir)
    {
        for (var i = 0; i < dir.dirs.length; ++i)
        {
            dir.dirs[i].prev = dir;
        }
        
        dir.dirs.forEach((d) => { set_prev(d); });
    }
    
    set_prev(_user.root);
    
    return _user;
}


let _user_id = NaN;

function user_init(u_id)
{
    _user_id = u_id;
    
    let xhttp = new XMLHttpRequest();
    
    xhttp.onreadystatechange = function()
    {
        if (this.readyState == 4 && this.status == 200)
        {
            user = user_from_string(this.responseText);
        }
    }
    
    xhttp.open('GET', 'php/user.php?init=1&id=' + _user_id, true);
    xhttp.send();
}

function user_update()
{
    let xhttp = new XMLHttpRequest();
    
    xhttp.onreadystatechange = function() {}
    
    xhttp.open('POST', 'php/user.php?id=' + _user_id, true);
    xhttp.send(user_to_string(user));
}


const terminal = {
    
    canvas: document.getElementById('terminal'),
    ctx: document.getElementById('terminal').getContext('2d'),
    
    init: function()
    {
        // This makes the screen less blurry, for some reason.
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        
        // Calculate terminal dimensions.
        this.screen.width = Math.floor(this.canvas.width / this.text.width);
        this.screen.height = Math.floor(this.canvas.height / this.text.height);
        
        // Create the RegExp to split input strings. (this splits strings into chunks as long as the screen width)
        this.split_regex = new RegExp(`[\\s\\S]{1,${this.screen.width}}`, 'g');
        
        // Add an initial string.
        this.screen.buffer_push(`${user_get_cwd(user)}> `);
        
        // Set font and call draw.
        this.ctx.font = '20px Consolas';
    },
    
    screen: {
        
        width: 0,
        height: 0,
        
        offset: 0,
        buffer: new Array(),
        
        buffer_push: function(str)
        {
            str.match(terminal.split_regex).forEach(s => { this.buffer.push(s); });
        },
    },
    
    cursor: {
        
        x: NaN,
        y: NaN,
    },
    
    text: {
        
        // Character dimensions.
        width: 14,
        height: 20,
    },
    
    split_regex: null,
    
    // The file to which to redirect the terminal output.
    redirect_output: null,
    
    show_cursor: true,
    
    exit_code: 0,
    
    command_buffer: new Array(),
    
    keys_pressed: new Array(),
    key_mode: false,
    
    line: '',
    index: 0,
    
    done_exec: true,
    
    prev: {
        
        commands: new Array(),
        index: 0,
    },
    
    keys: {
        
        shift: false,
        caps_lock: false,
        
        is_upper: function()
        {
            // This xor's the shift and the caps lock.
            return this.shift ? !this.caps_lock : this.caps_lock;
        },
    },
    
    draw: function()
    {
        // Clear the screen.
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Reset the drawing color.
        this.ctx.fillStyle = '#fff';
        
        // Find the smallest number out of the screen height plus the offset, and the length of the buffer.
        const lim = this.screen.height + this.screen.offset < this.screen.buffer.length ?
            this.screen.height + this.screen.offset : this.screen.buffer.length;
        
        // Output all of the visible text to the console.
        for (var i = this.screen.offset; i < lim; ++i)
        {
            for (var j = 0; j < this.screen.buffer[i].length; ++j)
            {
                this.ctx.fillText(this.screen.buffer[i][j],
                    this.text.width * j, this.text.height * (i - this.screen.offset + 1));
            }
        }
        
        if (this.show_cursor)
        {
            if (this.done_exec)
            {
                // Output the current input to the screen.
                if (this.screen.buffer[this.screen.buffer.length - 1].length + this.line.length <= this.screen.width)
                {
                    // Output the line.
                    for (var i = 0; i < this.line.length; ++i)
                    {
                        this.ctx.fillText(this.line[i],
                            this.text.width * (this.screen.buffer[this.screen.buffer.length - 1].length + i),
                            this.text.height * (this.screen.buffer.length - this.screen.offset));
                    }
                    
                    this.cursor.x = this.screen.buffer[this.screen.buffer.length - 1].length + this.index;
                    this.cursor.y = this.screen.buffer.length - this.screen.offset;
                    
                    this.draw_cursor();
                }
                
                else
                {
                    let len = this.screen.width - this.screen.buffer[this.screen.buffer.length - 1].length;
                    
                    // Split the input into chunks.
                    let strs = [this.line.substring(0, len)];
                    this.line.substring(len).match(this.split_regex).forEach(s => strs.push(s));
                    
                    // Output the first line.
                    for (var i = 0; i < strs[0].length; ++i)
                    {
                        this.ctx.fillText(strs[0][i],
                            this.text.width * (this.screen.buffer[this.screen.buffer.length - 1].length + i),
                            this.text.height * (this.screen.buffer.length - this.screen.offset));
                    }
                    
                    // Output the other lines.
                    for (var line = 1; line < strs.length; ++line)
                    {
                        for (var i = 0; i < strs[line].length; ++i)
                        {
                            this.ctx.fillText(strs[line][i],
                                this.text.width * (i),
                                this.text.height * (this.screen.buffer.length - this.screen.offset + line));
                        }
                    }
                    
                    this.cursor.x = (this.screen.buffer[this.screen.buffer.length - 1].length - 1 + this.index) % this.screen.width + 1;
                    this.cursor.y = this.screen.buffer.length - this.screen.offset + Math.floor((this.index + this.screen.buffer[this.screen.buffer.length - 1].length - 1) / this.screen.width);
                    
                    this.draw_cursor();
                }
            }
            
            else { this.draw_cursor(); }
        }
    },
    
    draw_cursor: function()
    {
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(this.text.width * this.cursor.x - 2, this.text.height * this.cursor.y - 16, 2, this.text.height);
    },
    
    print: function(arg)
    {
        const str = arg.toString();
        
        if (this.redirect_output)
        {
            this.redirect_output.contents += str + '\n';
        }
        
        else
        {
            for (var i = 0; i < str.length; ++i)
            {
                if (str[i] == '\n')
                {
                    this.screen.buffer.push('');
                }
                
                else if (this.screen.buffer[this.screen.buffer.length - 1].length == this.screen.width)
                {
                    this.screen.buffer.push(str[i]);
                }
                
                else { this.screen.buffer[this.screen.buffer.length - 1] += str[i]; }
            }
            
            this.screen.buffer.push('');
            this.refocus();
        }
    },
    
    getline: async function()
    {
        if (this.key_mode) { return null; }
        
        // This won't conflict with command execution, since only one command can run at a time.
        while (this.command_buffer.length == 0) { await this.delay(100); }
        
        return this.command_buffer.shift();
    },
    
    getkey: async function()
    {
        if (!this.key_mode) { return null; }
        
        while (this.keys_pressed.length == 0) { await this.delay(100); }
        
        return this.keys_pressed.shift();
    },
    
    refocus: function()
    {
        const ceil = Math.ceil((this.index + this.screen.buffer[this.screen.buffer.length - 1].length) / this.screen.width);
        
        if (this.screen.offset < this.screen.buffer.length - this.screen.height + ceil)
        {
            this.screen.offset = this.screen.buffer.length - this.screen.height + ceil;
        }
    },
    
    split: function(line)
    {
        const strings = new Array('');
        let redirect_output_index = null;
        
        for (var i = 0; i < line.length; ++i)
        {
            if (!/\s/.test(line[i]))
            {
                // If the char is a quote, start parsing regardless of whitespace.
                if (line[i] == '\"')
                {
                    if (strings[strings.length - 1].length != 0) { return null; }
                    
                    ++i;
                    if (i == line.length) { return null; }
                    
                    while (line[i] != '\"')
                    {
                        strings[strings.length - 1] += line[i];
                        
                        ++i;
                        if (i == line.length) { return null; }
                    }
                    
                    // Only push if there is more chars after the quote.
                    if (i != line.length - 1 && !/\s+/.test(line.substring(i))) { strings.push(''); }
                }
                
                // If the char is a dollar sign, begin parsing the expression.
                else if (line[i] == '$')
                {
                    if (i + 1 == line.length) { return null; }
                    
                    let str = '';
                    
                    if (line[i + 1] == '{')
                    {
                        ++i;
                        
                        while (line[i + 1] != '}')
                        {
                            if (i + 1 == line.length) { return null; }
                            
                            str += line[i + 1];
                            
                            ++i;
                        }
                        
                        // Go past the closing brace.
                        ++i;
                    }
                    
                    else
                    {
                        while (i + 1 != line.length && !/\s/.test(line[i + 1]))
                        {
                            if (line[i + 1] == '$') { break; }
                            
                            str += line[i + 1];
                            ++i;
                        }
                    }
                    
                    switch (str.toLowerCase())
                    {
                    case '?': strings[strings.length - 1] += this.exit_code.toString(); break;
                    case 'cwd': strings[strings.length - 1] += user_get_cwd(user); break;
                        
                    default:
                        
                        let v = user.vars.find(v => { return v.name == str; });
                        
                        if (!v)
                        {
                            // Do a case-insensitive search if the case-sensitive one failed.
                            v = user.vars.find(v => { return v.name.toLowerCase() == str.toLowerCase(); })
                            if (!v) { return null; }
                        }
                        
                        if (v.contents.length == 1)
                        {
                            strings[strings.length - 1] += v.contents[0];
                        }
                        
                        else
                        {
                            strings[strings.length - 1] += v.contents[0];
                            
                            v.contents.slice(1).forEach(s => { strings.push(s); });
                        }
                        break;
                    }
                }
                
                // If the char is a backslash, add the next char regardless of it's meaning.
                else if (line[i] == '\\')
                {
                    ++i;
                    
                    // If the end of the string was reached or the next char is whitespace, report failure.
                    if (i == line.length || /\s/.test(line[i])) { return null; }
                    else { strings[strings.length - 1] += line[i]; }
                }
                
                else if (line[i] == '>')
                {
                    
                    if (strings[strings.length - 1].length != 0)
                    {
                        // Set the index at which the file should be.
                        redirect_output_index = strings.length;
                        
                        strings.push('');
                    }
                    
                    else { redirect_output_index = strings.length - 1; }
                }
                
                // If the char is not whitespace, simply add it to the last argument.
                else { strings[strings.length - 1] += line[i]; }
            }
            
            else
            {
                if (i + 1 == line.length) { break; }
                
                while (/\s/.test(line[i + 1]))
                {
                    ++i;
                    if (i + 1 == line.length) { break; };
                }
                
                if (strings[strings.length - 1].length != 0) { strings.push(''); }
            }
        }
        
        // If the index was set, find the file and set it as the fil to redirect output into.
        if (redirect_output_index != null)
        {
            // There where either none, or multiple files; invalid either way.
            if (strings.length != redirect_output_index + 1) { return null; }
            
            else
            {
                let dir_path = strings[redirect_output_index].split('/');
                const name = dir_path.pop();
                
                if (name.length == 0 || /^\s*$/.test(name))
                {
                    return null;
                }
                
                const dir = user_get_dir(user, dir_path.length == 0 ? '.' : dir_path.join('/'));
                
                // If the directory the file is in doesn't exist, then neither does the file.
                if (!dir)
                {
                    return null;
                }
                
                // Try to find the file.
                this.redirect_output = dir.files.find(file => { return file.name == name; });
                
                // If the file doesn't exist, make it.
                if (!this.redirect_output)
                {
                    dir.files.push({ name: name, contents: '' });
                    
                    // Sort the files to keep them organized.
                    dir.files.sort((a, b) => { return a.name.localeCompare(b.name); });
                    
                    // Set the redirect file.
                    this.redirect_output = dir.files.find(file => { return file.name == name; });
                }
                
                // If the file exists, remove its current contents.
                else { this.redirect_output.contents = ''; }
            }
            
            // Remove the last strings, since that was the redirection command.
            strings.pop();
        }
        
        return strings;
    },
    
    delay: async function(milliseconds)
    {
        await new Promise(resolve => setTimeout(resolve, milliseconds));
    },
    
    call: async function(name, user, ...args)
    {
        let com = func[name.toLowerCase()];
        
        if (com)
        {
            this.screen.buffer.push('');
            this.exit_code = await com(this, user, ...args);
            
            // Make sure that the exit code it a valid number.
            if (this.exit_code == undefined) { this.exit_code = 0; }
        }
        
        else
        {
            this.screen.buffer_push(`command '${name}' does not exist.`);
            this.screen.buffer.push('');
        }
    },
    
    execute: async function(command)
    {
        // Add the string to the screen buffer.
        if (this.screen.buffer[this.screen.buffer.length - 1].length + command.length <= this.screen.width)
        {
            this.screen.buffer[this.screen.buffer.length - 1] += command;
        }
        
        else
        {
            // Store this value in a variable since the length
            // of the final string will be changed half-way through.
            const len = this.screen.width - this.screen.buffer[this.screen.buffer.length - 1].length;
            
            this.screen.buffer[this.screen.buffer.length - 1] += command.substring(0, len);
            this.screen.buffer_push(command.substring(len));
        }
        
        // Execute the string.
        let args = this.split(command);
        
        if (!/^\s*$/.test(command))
        {
            if (args != null)
            {
                // Convert the function to lower case cuz why not.
                const name = args[0];
                
                if (args.length == 1) { args = []; }
                else { args.shift(); }
                
                await this.call(name, user, ...args);
                
                // Clear the redirect file, just in case.
                this.redirect_output = null;
            }
            
            else
            {
                this.screen.buffer_push('invalid syntax.');
                this.screen.buffer.push('');
            }
        }
        
        // Update the servers version of the user in case something changed.
        user_update();
    },
};

terminal.init();


setInterval(async () => {
    
    if (terminal.done_exec && terminal.command_buffer.length != 0)
    {
        terminal.done_exec = false;
        terminal.show_cursor = false;
        
        // Execute the first command in the buffer.
        await terminal.execute(terminal.command_buffer.shift());
        
        terminal.screen.buffer_push(`${user_get_cwd(user)}> `);
        
        // Refocus the screen.
        terminal.refocus();
        
        terminal.key_mode = false;
        terminal.show_cursor = true;
        
        terminal.done_exec = true;
    }
    
    terminal.draw();
    
}, 50);


document.addEventListener('keydown', async e => {
    
    // Set caps lock.
    terminal.keys.caps_lock = e.getModifierState('CapsLock');
    
    switch (e.keyCode)
    {
    // Shift.
    case 16:
        
        terminal.keys.shift = true;
        break;
        
    // Escape.
    case 27:
        
        if (terminal.key_mode)
        {
            terminal.keys_pressed.push('escape');
        }
        
        else
        {
            // Escape clears the current string.
            terminal.line = '';
            terminal.index = 0;
            terminal.prev.index = terminal.prev.commands.length;
            
            terminal.refocus();
        }
        break;
        
    // Backspace.
    case 8:
        
        if (terminal.key_mode)
        {
            terminal.keys_pressed.push('backspace');
        }
        
        else
        {
            if (terminal.index)
            {
                // If the index is right after the first char, simply call substring.
                if (terminal.index == 1)
                {
                    terminal.line = terminal.line.substring(1);
                }
                
                // If the index is right after the last char, substring will also do.
                else if (terminal.index == terminal.line.length)
                {
                    terminal.line = terminal.line.substring(0, terminal.line.length - 1);
                }
                
                // Otherwise, two calls of substring will be needed, one for everything before the deleted char,
                // and a second call to substring for everything after it.
                else
                {
                    terminal.line = terminal.line.substring(0, terminal.index - 1) +
                        terminal.line.substring(terminal.index);
                }
                
                --terminal.index;
            }
            
            // Set the command index to the end of the buffer (no command selected.)
            terminal.prev.index = terminal.prev.commands.length;
            
            terminal.refocus();
        }
        break;
        
    // Enter.
    case 13:
        
        if (terminal.key_mode)
        {
            terminal.keys_pressed.push('enter');
        }
        
        else
        {
            terminal.command_buffer.push(terminal.line);
            
            // Push the previous command onto the command buffer.
            if (terminal.prev.commands.length == 0)
            {
                terminal.prev.commands.push(terminal.line);
                ++terminal.prev.index;
            }
            
            else if (terminal.prev.commands[terminal.prev.commands.length - 1] != terminal.line)
            {
                terminal.prev.commands.push(terminal.line);
                ++terminal.prev.index;
            }
            
            terminal.line = '';
            terminal.index = 0;
            
            // Set the command offset to none selected.
            terminal.prev.index = terminal.prev.commands.length;
        }
        break;
        
    // Home.
    case 36:
        
        if (terminal.key_mode)
        {
            terminal.keys_pressed.push('home');
        }
        
        else
        {
            // Home goes to the start of the string.
            terminal.index = 0;
            
            terminal.refocus();
        }
        break;
        
    // End.
    case 35:
        
        if (terminal.key_mode)
        {
            terminal.keys_pressed.push('end');
        }
        
        else
        {
            // End goes to the end of the string.
            terminal.index = terminal.line.length;
            
            terminal.refocus();
        }
        break;
        
    // Page up.
    case 33:
        
        if (terminal.key_mode)
        {
            terminal.keys_pressed.push('page up');
        }
        
        else
        {
            if (terminal.screen.offset < terminal.screen.height)
            {
                terminal.screen.offset = 0;
            }
            
            else
            {
                terminal.screen.offset -= terminal.screen.height;
            }
        }
        break;
        
    // Page down.
    case 34:
        
        if (terminal.key_mode)
        {
            terminal.keys_pressed.push('page down');
        }
        
        else
        {
            // This check is here to prevent the screen from going past the actual text.
            if (terminal.screen.offset + terminal.screen.height > terminal.screen.buffer.length)
            {
                terminal.screen.offset = terminal.screen.buffer.length - 1;
            }
            
            else
            {
                terminal.screen.offset += terminal.screen.height;
            }
        }
        break;
        
    // Up arrow.
    case 38:
        
        if (terminal.key_mode)
        {
            terminal.keys_pressed.push(terminal.keys.shift ? 'shift up arrow' : 'up arrow');
        }
        
        else
        {
            if (!terminal.keys.shift)
            {
                // Up arrow selects the previously entered command.
                if (terminal.prev.index > 0)
                {
                    --terminal.prev.index;
                    terminal.line = terminal.prev.commands[terminal.prev.index];
                    terminal.index = terminal.line.length;
                }
                
                terminal.refocus();
            }
            
            // Shift + up arrow pulls the screen upward.
            else if (terminal.screen.offset > 0)
            {
                --terminal.screen.offset;
            }
        }
        break;
        
    // Down arrow.
    case 40:
        
        if (terminal.key_mode)
        {
            terminal.keys_pressed.push(terminal.keys.shift ? 'shift down arrow' : 'down arrow');
        }
        
        else
        {
            if (!terminal.keys.shift)
            {
                // Down arrow selects the command after the currently selected one,
                // if a previous command has already been selected.
                if (terminal.prev.index + 1 < terminal.prev.commands.length)
                {
                    ++terminal.prev.index;
                    terminal.line = terminal.prev.commands[terminal.prev.index];
                    terminal.index = terminal.line.length;
                }
                
                terminal.refocus();
            }
            
            // Shift + down arrow pushes the screen downward, if doing so won't go past the end of the screen.
            else if (terminal.screen.buffer.length - terminal.screen.offset > 1)
            {
                ++terminal.screen.offset;
            }
        }
        break;
        
    // Left arrow.
    case 37:
        
        if (terminal.key_mode)
        {
            terminal.keys_pressed.push(terminal.keys.shift ? 'shift left arrow' : 'left arrow');
        }
        
        else
        {
            if (!terminal.keys.shift)
            {
                // Left arrow moves one step to the left.
                if (terminal.index != 0)
                {
                    --terminal.index;
                }
            }
            
            else
            {
                // Shift + left arrow moves to the start of the string.
                terminal.index = 0;
            }
            
            terminal.refocus();
        }
        break;
        
    // Right arrow.
    case 39:
        
        if (terminal.key_mode)
        {
            terminal.keys_pressed.push(terminal.keys.shift ? 'shift right arrow' : 'right arrow');
        }
        
        else
        {
            if (!terminal.keys.shift)
            {
                // Right arrow moves one step to the right.
                if (terminal.index != terminal.line.length)
                {
                    ++terminal.index;
                }
            }
            
            else
            {
                // Shift + right arrow moves to the end of the string.
                terminal.index = terminal.line.length;
            }
            
            terminal.refocus();
        }
        break;
        
    default:
        
        if (terminal.key_mode)
        {
            if (e.which == undefined || typeof e.which == 'number' && e.which != 0 && e.key.length == 1)
            {
                terminal.keys_pressed.push(terminal.keys.is_upper() ? e.key.toUpperCase() : e.key);
            }
        }
        
        else
        {
            if (terminal.line.length < 128)
            {
                if (typeof e.which == undefined || typeof e.which == 'number' && e.which != 0 && e.key.length == 1)
                {
                    // If the index is zero, it simply gets added to the start of the string.
                    if (terminal.index == 0)
                    {
                        terminal.line = (terminal.keys.is_upper() ? e.key.toUpperCase() : e.key) +
                            terminal.line;
                    }
                    
                    // If the index is at the end of the string, concatenate it onto the string.
                    else if (terminal.index == terminal.line.length)
                    {
                        terminal.line += terminal.keys.is_upper() ? e.key.toUpperCase() : e.key;
                    }
                    
                    // Otherwise, cleave the string into two substrings, and add the char in the middle.
                    else
                    {
                        terminal.line = terminal.line.substring(0, terminal.index) +
                            (terminal.keys.is_upper() ? e.key.toUpperCase() : e.key) +
                            terminal.line.substring(terminal.index);
                    }
                    
                    // Setting the index just out of bounds mean that no previous command is selected.
                    terminal.prev.index = terminal.prev.commands.length;
                    
                    // Incrment the line index to make chars get inserted in an intuitive way.
                    ++terminal.index;
                }
            }
            
            terminal.refocus();
        }
        break;
    }
});


document.addEventListener('keyup', async e => {
    
    switch (e.keyCode)
    {
    // Shift.
    case 16:
        
        terminal.keys.shift = false;
        break;
    }
});
